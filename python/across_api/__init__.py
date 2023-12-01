from astropy.utils import iers  # type: ignore

from ._version import __version__  # noqa: F401

iers.conf.auto_download = False
