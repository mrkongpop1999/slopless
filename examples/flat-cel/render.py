import sys, pathlib
from playwright.sync_api import sync_playwright
# usage: render.py <html> <outprefix> t1 t2 ...
html, out = sys.argv[1], sys.argv[2]
times = [float(x) for x in sys.argv[3:]]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    pg.goto(pathlib.Path(html).resolve().as_uri())
    pg.wait_for_function('window.ready === true', timeout=20000)
    for t in times:
        pg.evaluate(f'draw({t})')
        pg.locator('#c').screenshot(path=f'{out}_{t:.2f}.png')
    b.close()
