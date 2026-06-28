def format_size(b):
    if b < 1024:        return f"{b}B"
    elif b < 1024**2:   return f"{b/1024:.1f}KB"
    elif b < 1024**3:   return f"{b/(1024**2):.1f}MB"
    else:               return f"{b/(1024**3):.2f}GB"


def format_time(s):
    s = int(s)
    if s < 60:     return f"{s}s"
    elif s < 3600: return f"{s//60}m {s%60}s"
    else:          return f"{s//3600}h {(s%3600)//60}m"