from datetime import datetime, timedelta
from typing import List, Optional

import requests

from ..api_db import dydbtable
from .models import TLEEntryModelBase
from .schema import TLEEntry


class TLEBase:
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
    read_tle_celestrak
        Return latest TLE from Celestrak
    read_db
        Read the best TLE for a given epoch from the local database of TLEs
    write_db
        Write a TLE to the database
    read_db_all_tles
        Write all loaded TLEs to database
    """

    # Configuration parameters
    tle_heasarc: str
    tle_url: str
    tle_celestrak: str
    tle_bad: int
    tle_name: str
    # Arguments
    epoch: datetime
    tles: List[TLEEntry]

    def __init__(self):
        self.tlemodel = TLEEntryModelBase

    def read_tle_web(self) -> bool:
        """Read TLE from dedicated weblink"""

        # Download TLE from internet
        try:
            tlefile = requests.get(self.tle_url).text.splitlines()
        except Exception:
            return False

        # Load the TLE
        tle = TLEEntry(tle1=tlefile[-2].strip(), tle2=tlefile[-1].strip())
        self.tles.append(tle)

        # No good TLE was found
        if self.tle_out_of_date:
            return False

        return True

    def read_tle_heasarc(self) -> bool:
        """Read TLEs in the HEASARC MISSION_TLE_ARCHIVE.tle format"""

        # Fetch TLE file off the web
        tleweb = requests.get(self.tle_heasarc)
        if tleweb.status_code == 200:
            tlefile = tleweb.text.splitlines()
        else:
            return False

        # Parse the file
        self.tles = []
        for i in range(0, len(tlefile), 2):
            # Create the TLEEntry
            tle = TLEEntry(tle1=tlefile[i].strip(), tle2=tlefile[i + 1].strip())

            # Append it to the list of TLEs
            self.tles.append(tle)
        return True

    @property
    def tle(self) -> Optional[TLEEntry]:
        """Return the best TLE out of the TLEs currently loaded for a the given epoch

        Returns
        -------
        Optional[TLEEntry]
            Best TLE for the given epoch
        """
        if self.epoch is not None and len(self.tles) > 0:
            return min(
                self.tles, key=lambda x: abs((x.epoch - self.epoch).total_seconds())
            )
        return None

    def read_tle_celestrak(self) -> bool:
        """Return latest TLE from Celestrak

        Returns
        -------
        bool
            Did it work?
        """
        # Fetch TLE file from Celestrak
        try:
            req = requests.get(self.tle_celestrak)
        except Exception:
            return False
        if req.status_code == 200:
            urltles = req.text
        else:
            return False

        # Read in Celestrak combined TLE and fetch the one we want
        lines = urltles.splitlines()
        tle = []
        go = False
        for line in lines:
            if go:
                tle.append(line)
            if line.strip() == self.tle_name:
                go = True
            if len(tle) == 2:
                go = False

        # Create the self.tlemodel
        self.tles.append(TLEEntry(tle1=tle[0], tle2=tle[1]))

        return True

    @property
    def tle_out_of_date(self) -> bool:
        """Is this TLE outside of the allowed range?

        Returns
        -------
        bool
            Is this TLE out of date?
        """
        if self.tle is not None:
            if (
                abs((self.epoch - self.tle.epoch).total_seconds() / 86400)
                > self.tle_bad
            ):
                return True
        return False

    def get(self, epoch: Optional[datetime] = None) -> Optional[TLEEntry]:
        """Read in the best TLE for a given epoch.

        Parameters
        ----------
        epoch
            Epoch for which you want to retrieve a TLE

        Returns
        -------
            Best TLE for the given epoch

        """
        if epoch is not None:
            self.epoch = epoch
        # Try reading from the database first
        if self.read_db() is True:
            if self.tle is not None:
                return self.tle

        # Next try reading from the web
        if self.tle_url is not None:
            if self.read_tle_web() is True:
                # Write this TLE to the database for next time
                self.write_db()
                return self.tle

        # Try reading in the HEASARC format
        if self.tle_heasarc is not None:
            if self.read_tle_heasarc() is True:
                self.write_db()
                return self.tle
        # Last resort, get it off Celestrak
        if self.tle_celestrak is not None and abs(
            self.epoch - datetime.now()
        ) < timedelta(days=self.tle_bad):
            if self.read_tle_celestrak() is True:
                self.write_db()
                return self.tle

        return None

    def read_db(self) -> bool:
        """
        Read the best TLE for a given epoch from the local database of TLEs

        Returns
        -------
        bool
            Did it work?
        """

        tles = self.tlemodel.find_keys_between_epochs(
            self.epoch - timedelta(days=self.tle_bad),
            self.epoch + timedelta(days=self.tle_bad),
        )

        self.tles = [TLEEntry(**tle.__dict__) for tle in tles]

        return True

    def write_db(self) -> bool:
        """
        Write a TLE to the database

        Returns
        -------
        bool
            Did it work?
        """
        # Write out the data to the table
        if self.tle is not None:
            tledb = self.tlemodel(
                epoch=str(self.tle.epoch), tle1=self.tle.tle1, tle2=self.tle.tle2
            )
            tledb.save()
        return True

    def write_db_all_tles(self) -> bool:
        """Write all loaded TLEs to database

        Returns
        -------
        bool
            Did it work?

        """
        # Load everything already in the table
        table = dydbtable(self.tlemodel.__tablename__)
        existing = table.scan()
        epochs = [e["epoch"] for e in existing["Items"]]
        # Write TLEs to database
        with table.batch_writer() as batch:
            for t in self.tles:
                if t.epoch in epochs:
                    continue
                tdb = TLEEntryModelBase(epoch=str(t.epoch), tle1=t.tle1, tle2=t.tle2)
                epochs.append(t.epoch)
                batch.put_item(Item=tdb.__dict__)

        return True
