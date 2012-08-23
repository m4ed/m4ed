def constant_time_compare(actual, expected):
    """
    Returns True if the two strings are equal, False otherwise
    The time taken is dependent on the number of charaters provided
    instead of the number of characters that match.
    Shamelessly borrowed from reddit's code available at
    https://github.com/reddit/reddit/blob/master/r2/r2/lib/utils/utils.py
    """
    actual_len = len(actual)
    expected_len = len(expected)
    result = actual_len ^ expected_len
    if expected_len > 0:
        for i in xrange(actual_len):
            result |= ord(actual[i]) ^ ord(expected[i % expected_len])
    return result == 0
