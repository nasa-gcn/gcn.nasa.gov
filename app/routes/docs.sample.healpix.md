---
handle:
  breadcrumb: HEALPix
---

# HEALPix Sky Maps

[HEALPix](https://healpix.sourceforge.io) (<b>H</b>ierarchical, <b>E</b>qual <b>A</b>rea, and iso-<b>L</b>atitude <b>Pix</b>elisation) is a scheme for indexing positions on the unit sphere.
For localization of events, the multi-messenger community uses the standard HEALPix [@2005ApJ...622..759G] with the file extension `.fits.gz`, as well as multi-resolution HEALPix-in-FITS file format [@2015A&A...578A.114F] with the file extension `.multiorder.fits`. The preferred format is the multi-resolution HEALPix format.

### Multi-Order Sky Maps

GCN strongly encourages the use of multi-order sky maps. They utilize a variable resolution, with higher probability regions having higher resolution and lower probability regions being encoded with a lower resolution. Variable resolution allows multi-order sky maps to be significantly more efficient than single-resolution HEALPix sky maps with respect to both storage footprint and read speed.

#### Reading Sky Maps

Sky maps can be parsed using Python and a small number of packages. While this documentation covers the use of `astropy-healpix`, there are several packages that can be used for this purpose; a number of [alternatives](#other-documentation-and-healpix-packages) are listed at the bottom of this page.

```python
import astropy_healpix as ah
import numpy as np

from astropy import units as u
from astropy.table import QTable
```

A given sky map can then be read in as:

```python
skymap = QTable.read('skymap.multiorder.fits')
```

#### Most Probable Sky Location

Let's calculate the index of the sky point with the highest probability density, as follows:

```python
hp_index = np.argmax(skymap['PROBDENSITY'])
uniq = skymap[hp_index]['UNIQ']

level, ipix = ah.uniq_to_level_ipix(uniq)
nside = ah.level_to_nside(level)

ra, dec = ah.healpix_to_lonlat(ipix, nside, order='nested')
```

#### Probability Density at a Known Position

Similarly, one can calculate the probability density at a known position:

```python
ra, dec = 197.450341598 * u.deg, -23.3814675445 * u.deg

level, ipix = ah.uniq_to_level_ipix(skymap['UNIQ'])
nside = ah.level_to_nside(level)

match_ipix = ah.lonlat_to_healpix(ra, dec, nside, order='nested')

match_index = np.flatnonzero(ipix == match_ipix)[0]

prob_density = skymap[match_index]['PROBDENSITY'].to_value(u.deg**-2)
```

#### 90% Probability Region

The estimation of a 90% probability region involves sorting the pixels, calculating the area of each pixel, and then summing the probability of each pixel until 90% is reached.

```python
#Sort the pixels by descending probability density
skymap.sort('PROBDENSITY', reverse=True)

#Area of each pixel
level, ipix = ah.uniq_to_level_ipix(skymap['UNIQ'])
pixel_area = ah.nside_to_pixel_area(ah.level_to_nside(level))

#Pixel area times the probability
prob = pixel_area * skymap['PROBDENSITY']

#Cumulative sum of probability
cumprob = np.cumsum(prob)

#Pixels for which cumulative is 0.9
i = cumprob.searchsorted(0.9)

#Sum of the areas of the pixels up to that one
area_90 = pixel_area[:i].sum()
area_90.to_value(u.deg**2)
```

### Flat Resolution HEALPix Sky maps

A sky map `.fits.gz` file can be read in using `healpy`:

```python
import healpy as hp
import numpy as np
from matplotlib import pyplot as plt

# Read both the HEALPix image data and the FITS header
hpx, header = hp.read_map('skymap.fits.gz', h=True)

# Plot a Mollweide-projection all-sky image
np.mollview(hpx)
plt.show()
```

#### Most Probable Sky Location

The point on the sky with the highest probability can be found by finding the maximum value in the HEALPix sky map:

```python
# Reading Sky Maps with Healpy
healpix_image = hp.read_map('bayestar.fits.gz,0')
npix = len(hpx)

# Lateral resolution of the HEALPix map
nside = hp.npix2nside(npix)

# Find the highest probability pixel
ipix_max = np.argmax(hpx)

# Probability density per square degree at that position
hpx[ipix_max] / hp.nside2pixarea(nside, degrees=True)

# Highest probability pixel on the sky
ra, dec = hp.pix2ang(nside, ipix_max, lonlat=True)
ra, dec
```

#### Integrated probability in a Circle

We can calculate the integrated probability within an arbitrary circle on the sky:

```python
# First define the Cartesian coordinates of the center of the circle
ra = 180.0
dec = -45.0
radius = 2.5

# Calculate Cartesian coordinates of the center of the Circle
xyz = hp.ang2vec(ra, dec, lonlat=True)

# Obtain an array of indices for the pixels inside the circle
ipix_disc = hp.query_disc(nside, xyz, np.deg2rad(radius))

# Sum the probability in all of the matching pixels:
hpx[ipix_disc].sum()
```

#### Integrated probability in a Polygon

Similar to the integrated probability within a circle, it is possible to calculate the integrated probability of the source lying within an arbitrary polygon:

```python
#  Indices of the pixels within a polygon (defined by the Cartesian coordinates of its vertices)

xyz = [[0, 0, 0],
       [1, 0, 0],
       [1, 1, 0],
       [0, 1, 0]]
ipix_poly = hp.query_polygon(nside, xyz)
hpx[ipix_poly].sum()
```

#### Other Documentation and HEALPix Packages

For more information and resources on the analysis of pixelated data on a sphere, explore the following links:

- Additional information can be found on the [LIGO website](https://emfollow.docs.ligo.org/userguide/tutorial/multiorder_skymaps.html)

- [healpy](https://healpy.readthedocs.io/en/latest/): Official Python library for handling the pixelated data on sphere

- [astropy-healpix](https://pypi.org/project/astropy-healpix/): Integrates HEALPix with Astropy for data manipulation and analysis

- [mhealpy](https://mhealpy.readthedocs.io/en/latest/): Object-oriented wrapper of healpy for handling the multi-resolution maps

- [MOCpy](https://cds-astro.github.io/mocpy/): Python library allowing easy creation, parsing and manipulation of Multi-Order Coverage maps.

## Bibliography
