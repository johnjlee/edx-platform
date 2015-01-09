"""
This is a localdev test for the Microsite processing pipeline
"""
# We intentionally define lots of variables that aren't used, and
# want to import all variables from base settings files
# pylint: disable=wildcard-import, unused-wildcard-import

from .dev import *
from ..dev import ENV_ROOT, FEATURES


MICROSITE_CONFIGURATION = {
    "ethicon": {
        "domain_prefix":"ethicon",
        "university":"ethicon",
        "platform_name": "Ethicon Online",
        "logo_image_url": "ethicon/images/Ethicon_RGB.png",
        "show_only_org_on_student_dashboard": True,
        "email_from_address": "no-reply@registration.edx.org",
        "payment_support_email": "no-reply@registration.edx.org",
        "ENABLE_MKTG_SITE":  False,
        "SITE_NAME": "ethicon.localhost",
        "course_org_filter": "Ethicon",
        "course_about_show_social_links": False,
        "css_overrides_file": "ethicon/css/ethicon.css",
        "show_partners": False,
        "show_homepage_promo_video": True,
        "homepage_promo_video_youtube_id": "RsRRMVzSXmE",
        "course_index_overlay_text": "<img src='/static/ethicon/images/Ethicon_Better_Surgery_Vertical.png' width='400' height='103' />",
        "homepage_overlay_html": "<img src='/static/ethicon/images/Ethicon_Better_Surgery_Vertical.png'  width='400' height='103' />",
        "favicon_path": "ethicon/images/Ethicon_Spectrum_Red_Logo.ico",
    }
}

MICROSITE_ROOT_DIR = ENV_ROOT / 'edx-microsite'

# pretend we are behind some marketing site, we want to be able to assert that the Microsite config values override
# this global setting
FEATURES['ENABLE_MKTG_SITE'] = True
FEATURES['USE_MICROSITES'] = True
