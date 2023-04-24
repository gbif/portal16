# Image caching, cropping and resizing

GBIF runs a **[Thumbor](https://thumbor.org)** server to perform caching, cropping, resizing and filtering of images.

For general instructions, see the [Thumbor documentation](https://thumbor.readthedocs.io/).  This file documents how our server is installed, configured and used.

## Usage

### Basic usage

See the Thumbor documentation.  With this image, `https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg`, we can simply cache it:

![Quercus rubra](https://api.gbif.org/v1/image/_vNy8HhjLsRikGe3yDjxx7y__IM=/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

or we can resize and crop it to 300×80px, and flip it horizontally, with the URL [`https://api.gbif.org/v1/image/rDlLGuaR5hxtaygg_AAYzw-amcg=/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg`](https://api.gbif.org/v1/image/rDlLGuaR5hxtaygg_AAYzw-amcg=/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

![300×80px, flipped horizontally](https://api.gbif.org/v1/image/rDlLGuaR5hxtaygg_AAYzw-amcg=/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

Using `fit-in/` we can resize it without cropping, and maintain the aspect ratio: [`https://api.gbif.org/v1/image/8JRfI6JDTXNflBLc3E91Ok9lEHk=/fit-in/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg`](https://api.gbif.org/v1/image/8JRfI6JDTXNflBLc3E91Ok9lEHk=/fit-in/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

![300×80px, flipped horizontally, aspect preserved](https://api.gbif.org/v1/image/8JRfI6JDTXNflBLc3E91Ok9lEHk=/fit-in/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

Adding the filter `/filters:quality(5)` sets the JPEG quality:

![160×80px, quality 5](https://api.gbif.org/v1/image/digfqCbtXm23gd_bDAVpwbPtKBs=/160x80/filters:quality(5)/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

### Occurrence images

To allow secure, public use of occurrence images, these may be accessed without the security key.

An occurrence with gbifId [2005380410](https://api.gbif.org/v1/occurrence/2005380410) and a media identifier `https://inaturalist-open-data.s3.amazonaws.com/photos/31610070/original.jpg` may be accessed with a URL like

```
https://api.gbif.org/v1/image/cache/occurrence/[gbifId]/media/[md5sum(identifier]
https://api.gbif.org/v1/image/cache/occurrence/2005380410/media/568639b65b65ddb9090d3d6ef1abce14
```

### Security

URLs must include a signature, to prevent others from using the service.  Thumbor's documentation lists [libraries for generating keys](https://thumbor.readthedocs.io/en/latest/libraries.html).  We use **[Not yet decided] Node library** to generate these keys for the portal.  The secret key needed is in the usual place.

For testing or debugging, you can generate keys on `thumbor-vh.gbif.org`:

```
$ imageurl 400x-600/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg
https://api.gbif.org/v1/image/PHSKQQvKlQX_hIuBAIbwFNJB1bQ=/400x-600/https%3A//apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg
```

or using Thumbor's utility, `/usr/local/bin/thumbor-url`.

#### Compatibility with the previous image-cache service.

The service is running in "unsafe" mode (not requiring a key).  This will be disabled once the old portal is replaced.

## Configuration

The server is set to cache source images indefinitely, and produce images with a JPEG quality of 80 by default. *Feature detection is not installed*.

Twenty processes run, ten on two servers, which Varnish accesses with a round-robin director.

The processes are [monitored by Nagios](http://manager.gbif.org/nagios/cgi-bin/status.cgi?host=prodthumbor1-vh) and [2](http://manager.gbif.org/nagios/cgi-bin/status.cgi?host=prodthumbor2-vh).

The servers has DNS aliases: `thumbor1.gbif.org` and `thumbor2.gbif.org`, and similarly for UAT and Dev.

## Installation

Installation is with Ansible, using the GBIF scripts, which are based on [ansible-thumbor-centos](https://github.com/lloydmeta/ansible-thumbor-centos/).  The [thumbor_hbase](https://github.com/gbif/thumbor_hbase) plugin is used, including a the customization for occurrence images.

The installed version is:

```
$ thumbor --version
Thumbor v7.4.7 (26-Jan-2023)
```
