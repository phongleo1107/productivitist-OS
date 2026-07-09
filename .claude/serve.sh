#!/bin/bash
python3 -m http.server "${PORT:-5173}" --directory out/renderer
