def log(step, msg=""):
    if msg:
        print(f"[NovaStream] {step} → {msg}")
    else:
        print(f"[NovaStream] {step}")