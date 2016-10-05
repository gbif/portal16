# Image caching, cropping and resizing

GBIF runs a **[Thumbor](http://thumbor.org)** server to perform caching, cropping, resizing and filtering of images.

For general instructions, see the [Thumbor documentation](http://thumbor.readthedocs.io/).  This file documents how our server is installed, configured and used.

## Usage

### Basic usage

See the Thumbor documentation.  With this image, `https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg`, we can simply cache it:

![Quercus rubra](http://api.gbif.org/v1/image/_vNy8HhjLsRikGe3yDjxx7y__IM=/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

or we can resize and crop it to 300×80px, and flip it horizontally, with the URL [`http://api.gbif.org/v1/image/rDlLGuaR5hxtaygg_AAYzw-amcg=/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg`](http://api.gbif.org/v1/image/rDlLGuaR5hxtaygg_AAYzw-amcg=/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

![300×80px, flipped horizontally](http://api.gbif.org/v1/image/rDlLGuaR5hxtaygg_AAYzw-amcg=/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

Using `fit-in/` we can resize it without cropping, and maintain the aspect ratio: [`http://api.gbif.org/v1/image/8JRfI6JDTXNflBLc3E91Ok9lEHk=/fit-in/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg`](http://api.gbif.org/v1/image/8JRfI6JDTXNflBLc3E91Ok9lEHk=/fit-in/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

![300×80px, flipped horizontally, aspect preserved](http://api.gbif.org/v1/image/8JRfI6JDTXNflBLc3E91Ok9lEHk=/fit-in/-300x80/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

Adding the filter `/filters:quality(5)` sets the JPEG quality:

![160×80px, quality 5](http://api.gbif.org/v1/image/digfqCbtXm23gd_bDAVpwbPtKBs=/160x80/filters:quality(5)/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg)

### Security

URLs must include a signature, to prevent others from using the service.  Thumbor's documentation lists [libraries for generating keys](http://thumbor.readthedocs.io/en/latest/libraries.html).  We use **TBD Node library?** to generate these keys for the portal.  The secret key needed is in the usual place.

For testing or debugging, you can generate keys on `thumbor-vh.gbif.org`:

```
$ imageurl 400x-600 http://upload.wikimedia.org/wikipedia/commons/4/4e/Eagle_beak_sideview_A.jpg
http://api.gbif.org/v1/image/b4WfZoi49K_vXGkJIRNJPQtf7D0=/400x-600/http://upload.wikimedia.org/wikipedia/commons/4/4e/Eagle_beak_sideview_A.jpg
```

or alternatively:

```
$ python -c 'from thumbor.crypto import Signer; signer = Signer("xxx-xxx-xxx"); print signer.signature("160x80/filters:quality(5)/https://apps.rhs.org.uk/plantselectorimages/detail/WSY0036490_3534.jpg")'
digfqCbtXm23gd_bDAVpwbPtKBs=
```

#### Compatibility with the previous image-cache service.

The service is running in "unsafe" mode (not requiring a key).  This will be disabled once the old portal is replaced.

## Configuration

The server is set to cache source images indefinitely, and produce images with a JPEG quality of 80 by default.

Ten processes run, which Varnish accesses with a round-robin director.

The processes are [monitored by Nagios](http://manager.gbif.org/nagios/cgi-bin/status.cgi?host=thumbor-vh).

The server has three DNS aliases: `thumbor.gbif.org`, `thumbor.gbif-uat.org` and `thumbor.gbif-dev.org`, so our Ansible scripts for Varnish work without modification.

## Installation

Installation is with Ansible, using the GBIF scripts, which are based on [ansible-thumbor-centos](https://github.com/lloydmeta/ansible-thumbor-centos/).

The installed version is:

```
$ thumbor --version
Thumbor v6.1.5 (18-Aug-2016)
```
