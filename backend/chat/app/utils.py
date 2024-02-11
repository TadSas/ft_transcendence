import uuid


def is_valid_uuid(uuid_to_test: str, version=4) -> bool:
    """

    Parameters
    ----------
    uuid_to_test : str1
    version : int, optional

    Returns
    -------
    bool

    """
    try:
        uuid_obj = uuid.UUID(uuid_to_test, version=version)
    except ValueError:
        return False

    return str(uuid_obj) == uuid_to_test
