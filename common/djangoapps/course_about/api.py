"""
The Python API layer of the Course About API. Essentially the middle tier of the project, responsible for all
business logic that is not directly tied to the data itself.

Data access is managed through the configured data module, or defaults to the project's data.py module.

This API is exposed via the RESTful layer (views.py) but may be used directly in-process.

"""
import logging
from django.conf import settings
from django.utils import importlib
from course_about import errors

DEFAULT_DATA_API = 'course_about.data'

log = logging.getLogger(__name__)


def get_course_about_details(course_id):
    """Get course about details for the given course ID.

    Given a Course ID, retrieve all the metadata necessary to fully describe the Course.

    Args:
        course_id (str): The String representation of a Course ID. Used to look up the requested
            course.

    Returns:
        A JSON serializable dictionary of metadata describing the course.

    Example:
        >>> get_course_about_details('edX/Demo/2014T2')
        {
            "advertised_start": "FALL",
            "announcement": "YYYY-MM-DD",
            "course_id": "edx/DemoCourse",
            "course_number": "DEMO101",
            "start": "YYYY-MM-DD",
            "end": "YYYY-MM-DD",
            "effort": "HH:MM",
            "display_name": "Demo Course",
            "is_new": true,
            "media": {
                "course_image": "/some/image/location.png"
            },
        }
    """
    return _data_api().get_course_about_details(course_id)


def _data_api():
    """Returns a Data API.
    This relies on Django settings to find the appropriate data API.

    We retrieve the settings in-line here (rather than using the
    top-level constant), so that @override_settings will work
    in the test suite.
    """
    api_path = getattr(settings, "COURSE_ABOUT_DATA_API", DEFAULT_DATA_API)
    try:
        return importlib.import_module(api_path)
    except (ImportError, ValueError):
        log.exception(u"Could not load module at '{path}'".format(path=api_path))
        raise errors.CourseAboutApiLoadError(api_path)
