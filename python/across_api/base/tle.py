import logging
from datetime import datetime, timedelta
from typing import List, Optional

import requests
from arc import tables  # type: ignore
from requests import HTTPError

from .common import ACROSSAPIBase
from .models import TLEEntry
from .schema import TLEGetSchema, TLESchema


class TLEBase(ACROSSAPIBase):
    """
    Class that reads and updates TLEs for Satellite from a database,
    and returns a skyfield EarthSatellite based on downloaded TLE file.
    If no TLEs are found, it will download the latest TLE from the internet,
    using various sources, e.g. HEASARC, Celestrak, etc.

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

    Methods
    -------
    get
        Get TLEs for given epoch
    tle_out_of_date
        Check if the given TLE is out of date
    read_tle_web
        Read TLE from dedicated weblink
    read_tle_heasarc
        Read TLEs in the HEASARC MISSION_TLE_ARCHIVE.tle format
    read_db
        Read the best TLE for a given epoch from the local database of TLEs
    write_db
        Write a TLE to the database
    write_db_all_tles
        Write all loaded TLEs to database
    """

    _schema = TLESchema
    _get_schema = TLEGetSchema

    # Configuration parameters
    tle_heasarc: Optional[str]
    tle_url: Optional[str]
    tle_bad: int
    tle_name: str
    tle_min_epoch: datetime
    # Arguments
    epoch: datetime
    # Attributes
    tles: List[TLEEntry] = []
    # Return values
    error: Optional[str]

    def read_tle_web(self) -> bool:
        """
        Read TLE from dedicated weblink.

        This method downloads the TLE (Two-Line Elements) from a dedicated weblink.
        It retrieves the TLE data, parses it, and stores the valid TLE entries in a list.
        Often websites (e.g. Celestrak) will have multiple TLEs for a given satellite,
        so this method will only store the TLEs that match the given satellite name,
        as stored in the `tle_name` attribute.

        Returns
        -------
            True if the TLE was successfully read and stored, False otherwise.
        """
        # Check if the URL is set
        if self.tle_url is None:
            return False

        # Download TLE from internet
        r = requests.get(self.tle_url)
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
                name=tlefile[i].strip(),
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

    def read_tle_heasarc(self) -> bool:
        """
        Read TLEs in the HEASARC MISSION_TLE_ARCHIVE.tle format. This
        format is used by the HEASARC to store TLEs for various missions.
        The format consists of a concatenation of all available TLEs,
        without the name header.

        Returns
        -------
            True if TLEs were successfully read, False otherwise.
        """
        # Check if the URL is set
        if self.tle_heasarc is None:
            return False

        # Download TLEs from internet
        r = requests.get(self.tle_heasarc)
        try:
            # Check for HTTP errors
            r.raise_for_status()
        except HTTPError as e:
            logging.exception(e)
            return False

        # Parse the file
        tlefile = r.text.splitlines()
        tles = [
            TLEEntry(
                name=self.tle_name,
                tle1=tlefile[i + 1].strip(),
                tle2=tlefile[i + 2].strip(),
            )
            for i in range(0, len(tlefile), 2)
            if self.tle_name in tlefile[i]
        ]

        # Append it to the list of TLEs
        self.tles.extend(tles)
        # Check if a good TLE was found
        if self.tle_out_of_date is False:
            return True
        return False

    @property
    def tle(self) -> Optional[TLEEntry]:
        """Return the best TLE out of the TLEs currently loaded for a the given epoch

        Returns
        -------
            Best TLE for the given epoch
        """
        if self.epoch is not None and len(self.tles) > 0:
            return min(
                self.tles, key=lambda x: abs((x.epoch - self.epoch).total_seconds())
            )
        return None

    @property
    def tle_out_of_date(self) -> bool:
        """Is this TLE outside of the allowed range?

        Returns
        -------
            Is this TLE out of date?
        """
        if self.tle is not None:
            # Calculate the number of days between the TLE epoch and the request epoch
            self.offset = round(
                abs((self.epoch - self.tle.epoch).total_seconds() / 86400), 2
            )
            # If this is greater than the allowed number of days, then return True
            if self.offset > self.tle_bad:
                return True
        return False

    def get(self) -> bool:
        """Read in the best TLE for a given epoch.

        Parameters
        ----------
        epoch
            Epoch for which you want to retrieve a TLE

        Returns
        -------
            Best TLE for the given epoch
        """

        # Check if the request is valid
        if self.validate_get() is False:
            return False

        # Check that the epoch is within the allowed range, if not
        # Just set to either the earliest of latest possible epoch
        # and just use that TLE to extrapolate.
        if self.epoch < self.tle_min_epoch:
            self.epoch = self.tle_min_epoch
        elif self.epoch > datetime.utcnow() + timedelta(days=self.tle_bad):
            self.epoch = datetime.utcnow()

        # Fetch TLE from the TLE database
        if self.read_db() is True:
            if self.tle is not None:
                return True

        # Next try reading from the web at the URL given
        # in `self.tle_url`
        if self.tle_url is not None:
            if self.read_tle_web() is True:
                # Write this TLE to the database for next time
                self.write_db()
                return True

        # Next try try reading the TLE given in the HEASARC format
        if self.tle_heasarc is not None:
            if self.read_tle_heasarc() is True:
                self.write_db()
                return True

        # If we did not find any valid TLEs, then return False
        return False

    def read_db(self) -> bool:
        """
        Read the best TLE for a given epoch from the local database of TLEs

        Returns
        -------
            Did it work?
        """
        # Read TLEs from the database for a given `tle_name` and epoch
        self.tles = TLEEntry.find_tles_between_epochs(
            self.tle_name,
            self.epoch - timedelta(days=self.tle_bad),
            self.epoch + timedelta(days=self.tle_bad),
        )

        return True

    def write_db(self) -> bool:
        """
        Write a TLE to the database.

        Returns
        -------
        bool
            Did it work?
        """
        # Write out the data to the table
        if self.tle is not None:
            tledb = TLEEntry(name=self.tle_name, tle1=self.tle.tle1, tle2=self.tle.tle2)
            tledb.write()
        return True

    def write_db_all_tles(self) -> bool:
        """
        Write all loaded TLEs to database.

        Returns
        -------
            Did it work?
        """
        # Load everything already in the table
        table = tables.table(TLEEntry.__tablename__)
        existing = table.scan()
        epochs = [e["epoch"] for e in existing["Items"]]
        # Write TLEs to database
        with table.batch_writer() as batch:
            for t in self.tles:
                if t.epoch in epochs:
                    continue
                tdb = TLEEntry(name=self.tle_name, tle1=t.tle1, tle2=t.tle2)
                epochs.append(t.epoch)
                batch.put_item(Item=tdb.__dict__)

        return True
