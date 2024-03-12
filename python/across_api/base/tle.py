# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


import logging
import os
from typing import List, Optional

import httpx
from astropy.time import Time  # type: ignore
from astropy.units import Quantity  # type: ignore
from httpx import HTTPError
from spacetrack import AsyncSpaceTrackClient  # type: ignore

from .common import ACROSSAPIBase
from .schema import TLEEntry, TLEGetSchema, TLESchema


class TLEBase(ACROSSAPIBase):
    """
    Class for retrieving and updating spacecraft TLEs in the TLE database. If
    the TLEs are not found in the database, they are retrieved from
    space-track.org based on the name of the spacecraft given by `tle_name`.
    Other backup methods for fetching the TLE include using either the supplied
    `tle_url`, or from the URL specified in the `tle_concat` attribute (in the
    concatenated TLE format). TLEs fetched are then written to the database for
    future use.

    Parameters
    ----------
    epoch
        Epoch of TLE to retrieve

    Attributes
    ----------
    tles
        List of TLEs currently loaded
    tle
        TLE entry for given epoch
    offset
        Offset between TLE epoch and requested epoch in days
    tle_name
        Name of the spacecraft as it appears in the Spacecraft Catalog.
    tle_url
        URL to retrieve the TLE from.
    tle_concat
        URL to retrieve the TLE from in concatenated format.
    tle_bad
        If the TLE is this many days old, it is considered outdated, and a new
        TLE will be retrieved.
    tle_min_epoch
        Minimum epoch for which TLEs are available, typically this will
        correspond to a date after the launch of the spacecraft.

    Methods
    -------
    get
        Get TLEs for given epoch
    tle_out_of_date
        Check if the given TLE is out of date
    read_tle_web
        Read TLE from dedicated weblink
    read_tle_concat
        Read TLEs in the concatenated format
    read_tle_db
        Read the best TLE for a given epoch from the local database of TLEs
    write_db
        Write a TLE to the database
    write_db_all_tles
        Write all loaded TLEs to database
    """

    _schema = TLESchema
    _get_schema = TLEGetSchema

    # Configuration parameters
    tle_concat: Optional[str]
    tle_url: Optional[str]
    tle_bad: Quantity
    tle_name: str
    tle_norad_id: int
    tle_min_epoch: Time
    # Arguments
    epoch: Time
    # Attributes
    tles: List[TLEEntry] = []
    # Return values
    error: Optional[str]

    def __init__(self, epoch: Time, tle: Optional[TLEEntry] = None):
        """
        Initialize a TLE object with the given epoch.

        Arguments
        ---------
        epoch
            The epoch of the TLE object.
        """
        self.epoch = epoch
        if tle is not None:
            self.tles = [tle]
        else:
            self.tles = []

    async def read_tle_db(self) -> bool:
        """
        Read the best TLE for a given epoch from the local database of TLEs

        Returns
        -------
            Did it work?
        """
        # Read TLEs from the database for a given `tle_name` and epoch within
        # the allowed range
        self.tles = await TLEEntry.find_tles_between_epochs(
            self.tle_name,
            self.epoch - self.tle_bad,
            self.epoch + self.tle_bad,
        )

        return True

    async def read_tle_web(self) -> bool:
        """
        Read TLE from dedicated weblink.

        This method downloads the TLE (Two-Line Elements) from a dedicated
        weblink. It retrieves the TLE data, parses it, and stores the valid TLE
        entries in a list. Often websites (e.g. Celestrak) will have multiple
        TLEs for a given satellite, so this method will only store the TLEs
        that match the given satellite name, as stored in the `tle_name`
        attribute.

        Returns
        -------
            True if the TLE was successfully read and stored, False otherwise.
        """
        # Check if the URL is set
        if self.tle_url is None:
            return False

        # Download TLE from internet
        async with httpx.AsyncClient() as client:
            r = await client.get(self.tle_url)
        try:
            # Check for HTTP errors
            r.raise_for_status()
        except HTTPError as e:
            logging.exception(e)
            return False

        # Read valid TLEs into a list
        tlefile = r.text.splitlines()
        tles = [
            TLEEntry(
                satname=tlefile[i].strip(),
                tle1=tlefile[i + 1].strip(),
                tle2=tlefile[i + 2].strip(),
            )
            for i in range(0, len(tlefile), 3)
            if self.tle_name in tlefile[i]
        ]

        # Append them to the list of stored TLEs
        self.tles.extend(tles)

        # Check if a good TLE for the current epoch was found
        if self.tle_out_of_date is False:
            return True

        return False

    async def read_tle_space_track(self) -> bool:
        """
        Read TLE from Space-Track.org.

        This method downloads the TLE (Two-Line Elements) from Space-Track.org.
        It retrieves the TLE data, parses it, and stores the valid TLE entries
        in a list. Often websites (e.g. Celestrak) will have multiple TLEs for
        a given satellite, so this method will only store the TLEs that match
        the given satellite name, as stored in the `tle_name` attribute.

        Returns
        -------
            True if the TLE was successfully read and stored, False otherwise.
        """
        # Check if the URL is set
        if self.tle_url is None:
            return False

        # Build space-track.org query
        epoch_start = self.epoch - self.tle_bad
        epoch_stop = self.epoch + self.tle_bad

        # Log into space-track.org
        async with AsyncSpaceTrackClient(
            identity=os.environ.get("SPACE_TRACK_USER"),
            password=os.environ.get("SPACE_TRACK_PASS"),
        ) as st:
            await st.authenticate()

            # Fetch the TLEs between the requested epochs
            tletext = await st.tle(
                norad_cat_id=self.tle_norad_id,
                orderby="epoch desc",
                limit=22,
                format="tle",
                epoch=f">{epoch_start.datetime},<{epoch_stop.datetime}",
            )
        # Check if we got a return
        if tletext == "":
            return False

        # Split the TLEs into individual lines
        tletext = tletext.splitlines()

        # Parse the results into a list of TLEEntry objects
        tles = [
            TLEEntry(
                satname=self.tle_name,
                tle1=tletext[i].strip(),
                tle2=tletext[i + 1].strip(),
            )
            for i in range(0, len(tletext), 2)
        ]

        # Append them to the list of stored TLEs
        self.tles.extend(tles)

        # Check if a good TLE for the current epoch was found
        if self.tle_out_of_date is False:
            return True

        return False

    async def read_tle_concat(self) -> bool:
        """
        Read TLEs in the CONCAT MISSION_TLE_ARCHIVE.tle format. This format is
        used by the CONCAT to store TLEs for various missions. The format
        consists of a concatenation of all available TLEs, without the name
        header.

        Returns
        -------
            True if TLEs were successfully read, False otherwise.
        """
        # Check if the URL is set
        if self.tle_concat is None:
            return False

        # Download TLEs from internet
        async with httpx.AsyncClient() as client:
            r = await client.get(self.tle_concat)
        try:
            # Check for HTTP errors
            r.raise_for_status()
        except HTTPError as e:
            logging.exception(e)
            return False

        # Parse the file into a list of TLEEntry objects
        tlefile = r.text.splitlines()
        tles = [
            TLEEntry(
                satname=self.tle_name,
                tle1=tlefile[i].strip(),
                tle2=tlefile[i + 1].strip(),
            )
            for i in range(0, len(tlefile), 2)
        ]

        # Append that list to the list of TLEs
        self.tles.extend(tles)

        # Check if a good TLE for the requested epoch was found
        if self.tle_out_of_date is False:
            return True
        return False

    @property
    def tle(self) -> Optional[TLEEntry]:
        """
        Return the best TLE out of the TLEs currently loaded for a the given
        epoch.

        Returns
        -------
            Best TLE for the given epoch, or None if no TLEs are loaded.
        """
        if self.epoch is not None and len(self.tles) > 0:
            return min(
                self.tles, key=lambda x: abs((x.epoch - self.epoch).to_value("s"))
            )
        return None

    @property
    def tle_out_of_date(self) -> Optional[bool]:
        """
        Is this TLE outside of the allowed range?

        Returns
        -------
            True if the epoch of the loaded TLE is more the `tle_bad` days off.
            Returns None if no TLE is loaded.
        """
        # Check if we have a TLE
        if self.tle is None:
            return None

        # Calculate the number of days between the TLE epoch and the requested
        # epoch. If this is greater than the allowed number of days (given by
        # `tle_bad`), then return True
        if abs(self.epoch - self.tle.epoch) > self.tle_bad:
            return True
        return False

    async def get(self) -> bool:
        """
        Find in the best TLE for a given epoch. This method will first try to
        read the TLE from the local database. If that fails, it will try to
        read the TLE from the internet (with support for two different TLE
        formats). If that fails, it will return False, indicating that no TLE
        was found.

        Parameters
        ----------
        epoch
            Epoch for which you want to retrieve a TLE.

        Returns
        -------
            True if a TLE was found, False otherwise.
        """

        # Check if the requested arguments are valid
        if self.validate_get() is False:
            return False

        # Check that the epoch is within the allowed range. If set
        # to before `tle_min_epoch`, then set it to `tle_min_epoch`. If set to
        # a value in the future, then set it to the current time to give the most
        # up to date TLE.
        if self.epoch < self.tle_min_epoch:
            self.epoch = self.tle_min_epoch
        elif self.epoch > Time.now().utc:
            self.epoch = Time.now().utc

        # Check if a TLE is loaded manually
        if self.tle is not None:
            return True

        # Fetch TLE from the TLE database
        if await self.read_tle_db() is True:
            if self.tle is not None:
                return True

        # Next try querying space-track.org for the TLE. This will only work if
        # the environment variables SPACE_TRACK_USER and
        # SPACE_TRACK_PASS are set, and valid.
        if await self.read_tle_space_track() is True:
            # Write the TLE to the database for next time
            if self.tle is not None:
                await self.tle.write()
                return True

        # Next try try reading the TLE given in the concatenated format at the
        # URL given by `tle_concat`. Concatenated format should have every TLE
        # for the satellite since launch in a single file, so it's safe to
        # query this for any date within the mission lifetime. For an example
        # of this format (for the NuSTAR mission), see here:
        # https://nustarsoc.caltech.edu/NuSTAR_Public/NuSTAROperationSite/NuSTAR.tle
        if self.tle_concat is not None:
            if self.read_tle_concat() is True:
                # Write the TLE to the database for next time
                if self.tle is not None:
                    await self.tle.write()
                    return True

        # Finally try reading from the web at the URL given by `tle_url`. Note
        # that URL based TLEs are usually only valid for the current epoch, so
        # we will only use this if the epoch being requested is within
        # `tle_bad` days of the current epoch.
        if self.tle_url is not None:
            if self.epoch > Time.now().utc - self.tle_bad:
                if self.read_tle_web() is True:
                    # Write the TLE to the database for next time
                    if self.tle is not None:
                        await self.tle.write()
                        return True

        # If we did not find any valid TLEs, then return False
        return False
