import subprocess
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
                                Table, TableStyle, ListFlowable, ListItem, KeepTogether)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def reg(name, query):
    p = subprocess.check_output(["fc-match", "-f", "%{file}", query], text=True).strip()
    pdfmetrics.registerFont(TTFont(name, p))

reg("DJ", "DejaVu Sans")
reg("DJB", "DejaVu Sans:bold")
reg("DJI", "DejaVu Sans:italic")
pdfmetrics.registerFontFamily("DJ", normal="DJ", bold="DJB", italic="DJI", boldItalic="DJB")
reg("MONO", "DejaVu Sans Mono")

VERDE = colors.HexColor("#4b6b57")
ESCURO = colors.HexColor("#23302a")
SUAVE = colors.HexColor("#6b7a70")
CREME = colors.HexColor("#f3f0e8")

ss = getSampleStyleSheet()
P = ParagraphStyle("P", parent=ss["Normal"], fontName="DJ", fontSize=10.5, leading=16,
                   spaceAfter=8, textColor=ESCURO)
H1 = ParagraphStyle("H1", parent=P, fontName="DJB", fontSize=19, leading=24,
                    spaceBefore=6, spaceAfter=10, textColor=VERDE)
H2 = ParagraphStyle("H2", parent=P, fontName="DJB", fontSize=13, leading=18,
                    spaceBefore=12, spaceAfter=6, textColor=ESCURO)
CAP = ParagraphStyle("CAP", parent=P, fontName="DJB", fontSize=8.5, leading=12,
                     textColor=SUAVE, spaceAfter=2)
LI = ParagraphStyle("LI", parent=P, spaceAfter=4)
CODE = ParagraphStyle("CODE", parent=P, fontName="MONO", fontSize=9, leading=14,
                      backColor=CREME, borderPadding=8, spaceBefore=4, spaceAfter=10,
                      textColor=ESCURO)
NOTA = ParagraphStyle("NOTA", parent=P, fontSize=10, leading=15, backColor=CREME,
                      borderPadding=9, spaceBefore=6, spaceAfter=12)
TIT = ParagraphStyle("TIT", parent=P, fontName="DJB", fontSize=30, leading=36,
                     textColor=VERDE, spaceAfter=6)
SUB = ParagraphStyle("SUB", parent=P, fontSize=12.5, leading=19, textColor=SUAVE)

def b(t): return Paragraph(t, P)
def code(t): return Paragraph(t.replace(" ", "&nbsp;").replace("\n", "<br/>"), CODE)
def bullets(itens):
    return ListFlowable([ListItem(Paragraph(i, LI), leftIndent=14) for i in itens],
                        bulletType="bullet", bulletFontName="DJ", bulletFontSize=8,
                        leftIndent=14, bulletColor=VERDE, spaceAfter=8)
def passos(itens):
    return ListFlowable([ListItem(Paragraph(i, LI), leftIndent=16) for i in itens],
                        bulletType="1", bulletFormat="%s.", bulletFontName="DJB",
                        bulletFontSize=10, leftIndent=16, bulletColor=VERDE, spaceAfter=8)

F = []

def capitulo(n, titulo):
    F.append(PageBreak())
    F.append(Paragraph(f"CHAPTER {n}", CAP))
    F.append(Paragraph(titulo, H1))

# ---------- cover ----------
F += [Spacer(1, 55*mm),
      Paragraph("The server manual", TIT),
      Paragraph("How to put the caretaker of the drive to work — from scratch, "
                "with no programming knowledge.", SUB),
      Spacer(1, 14*mm),
      Paragraph("Flor de Plasma · course area<br/>version 1 — August 2026", CAP)]

# ---------- contents ----------
F.append(PageBreak())
F.append(Paragraph("What is inside", H1))
sumario = [
    ("1", "What this server is, in one sentence"),
    ("2", "What it does for you (and what it does not)"),
    ("3", "What you need before you start"),
    ("4", "Where to download it and what to copy onto the drive"),
    ("5", "Starting it for the first time"),
    ("6", "How to know it is up"),
    ("7", "The folder is the shelf: how to arrange the files"),
    ("8", "Running a scan: files become lessons"),
    ("9", "Subtitles: the server writes them, the site only fetches"),
    ("10", "PDF pages become lesson material"),
    ("11", "When it does not work: the six common problems"),
    ("12", "Upkeep: what to do every week and every month"),
    ("13", "Taking the drive to another computer"),
    ("14", "Words you will meet along the way"),
]
linhas = [[Paragraph(f"<font color='#4b6b57'><b>{n}</b></font>", P), Paragraph(t, P)] for n, t in sumario]
tb = Table(linhas, colWidths=[14*mm, 140*mm])
tb.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"),
                        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
                        ("TOPPADDING", (0,0), (-1,-1), 5),
                        ("LINEBELOW", (0,0), (-1,-2), 0.4, colors.HexColor("#e2ded2"))]))
F.append(tb)

# ---------- 1 ----------
capitulo(1, "What this server is, in one sentence")
F += [b("Your external drive is a <b>shelf</b>: the videos, the handouts and the PDFs "
        "are all in there, each one in its own place."),
      b("The server is the <b>caretaker of that shelf</b>. It stores nothing of its own: "
        "it opens the shelf, reads what sits on each row and hands over whatever the site asks for."),
      b("It is a small program that lives inside the drive itself. You plug the drive into "
        "the computer, double-click, and the caretaker starts working. Close the window and "
        "it stops. It installs nothing on Windows and touches nothing outside the drive."),
      Paragraph("Why it exists: hosting video online is expensive and charges you for every "
                "student who watches. You already own the shelf, and it charges no monthly fee.", NOTA),
      Paragraph("The one rule that decides everything", H2),
      b("<b>The caretaker only works with the computer on and the drive plugged in.</b> "
        "Turn the computer off and the material goes offline until you turn it on again. "
        "That is not a fault — it is the price of paying no hosting. That is also why the main "
        "lessons will one day move to Vimeo, while the shelf remains the master archive.")]

# ---------- 2 ----------
capitulo(2, "What it does for you (and what it does not)")
F.append(Paragraph("It does", H2))
F.append(bullets([
    "<b>Reads the whole shelf</b> and builds the list of everything in there.",
    "<b>Works out how long</b> each video is on its own — you never type that by hand again.",
    "<b>Makes the thumbnail</b> by grabbing a frame from the video itself, when you do not supply one.",
    "<b>Writes the subtitles</b> for video spoken in Portuguese, with the timing of every single word.",
    "<b>Splits a PDF into pages</b>, one image per page, ready to become lesson material.",
    "<b>Serves the video to the site's player</b> for as long as it is up.",
]))
F.append(Paragraph("It does not", H2))
F.append(bullets([
    "<b>It does not start by itself.</b> No website can start a program on your computer — "
    "and it is a good thing that it cannot. The double-click is yours.",
    "<b>It does not keep the material online while the computer sleeps.</b>",
    "<b>It does not upload anything on its own.</b> Publishing stays your decision.",
    "<b>It does not convert video on the fly.</b> Export as MP4 (H.264 + AAC) and it plays "
    "everywhere, no conversion needed.",
]))

# ---------- 3 ----------
capitulo(3, "What you need before you start")
F.append(bullets([
    "<b>A computer with Windows 10 or 11.</b>",
    "<b>The external drive</b> where the videos live. It can be a hard drive, an SSD or a "
    "large USB stick — what matters is that the material fits.",
    "<b>About 15 minutes.</b> It is a one-off; after that it is always just a double-click.",
    "<b>Internet</b> only for the first setup, to download the parts.",
]))
F.append(Paragraph("You do not need", H2))
F.append(bullets([
    "You do not need to know how to program.",
    "You do not need to install Node, or FFmpeg, or anything at all on Windows: the parts "
    "live inside the drive.",
    "You do not need to be an administrator on the machine.",
]))
F.append(Paragraph("Free space: set aside around 400 MB on the drive just for the caretaker's "
                   "parts, on top of the material itself. That is very little — it fits on any "
                   "drive made today.", NOTA))

# ---------- 4 ----------
capitulo(4, "Where to download it and what to copy onto the drive")
F.append(b("The caretaker is a project of its own, separate from the site. It has its own "
           "folder, called <b>plasma-servidor</b>. On this machine it sits at:"))
F.append(code(r"C:\Users\xrafa\Programas\plasma-servidor"))
F.append(b("On a new computer you get that folder in one of three ways — pick the easiest:"))
F.append(passos([
    "<b>Copy it from another drive or USB stick.</b> It is just a folder.",
    "<b>Download the .zip from the repository</b> where the project is kept, and unpack it.",
    "<b>Clone it with Git</b>, if the machine already has Git.",
]))
F.append(Paragraph("Where to put it on the drive", H2))
F.append(b("Copy the folder to the <b>root of the drive</b> — the first level you see when you "
           "open it:"))
F.append(code(
    "PLASMA (your drive)\n"
    "├── INICIAR-SERVIDOR.bat     ← the double-click lives here\n"
    "├── servidor/                ← the caretaker's parts\n"
    "│   ├── node/                ← portable Node\n"
    "│   ├── ffmpeg/              ← portable ffmpeg and ffprobe\n"
    "│   ├── app.js\n"
    "│   └── biblioteca.db        ← the catalogue, a single file\n"
    "└── midia/                   ← the shelf: your videos and materials"))
F.append(Paragraph("The two parts that come from outside", H2))
F.append(b("If the folder you copied does not already bring the <b>node</b> and <b>ffmpeg</b> "
           "subfolders, download the portable versions (the ones that install nothing):"))
F.append(bullets([
    "<b>Node.js for Windows, the .zip version</b> — at <font color='#4b6b57'>nodejs.org/en/download</font>. "
    "Choose “Windows Binary (.zip)”, 64-bit. Unpack and rename the folder to "
    "<font name='MONO'>node</font>.",
    "<b>FFmpeg for Windows</b> — at <font color='#4b6b57'>ffmpeg.org/download.html</font>, "
    "under “Windows builds”. Inside the .zip, the <font name='MONO'>bin</font> folder holds "
    "<font name='MONO'>ffmpeg.exe</font> and <font name='MONO'>ffprobe.exe</font>: "
    "those two files are what matter.",
]))
F.append(KeepTogether([Paragraph("Keep both folders named exactly like this, in lower case: "
                   "<b>node</b> and <b>ffmpeg</b>. The start-up file looks for those names, and a "
                   "wrong name is the number one cause of “it won't open”.", NOTA)]))

# ---------- 5 ----------
capitulo(5, "Starting it for the first time")
F.append(passos([
    "<b>Plug in the drive</b> and wait for Windows to recognise it.",
    "<b>Open the drive</b> and double-click <font name='MONO'>INICIAR-SERVIDOR.bat</font>.",
    "<b>A black window opens.</b> That window is the caretaker working: <b>do not close it</b>. "
    "You can minimise it as much as you like.",
    "If Windows asks about the <b>Firewall</b>, tick <b>private network</b> and allow it. "
    "Without that the site cannot talk to it.",
    "Wait for the line saying it is listening on port <b>8787</b>.",
    "<b>Open the creator panel on the site.</b> The server card turns green.",
]))
F.append(Paragraph("To shut it down: close the black window, or press Ctrl+C inside it. "
                   "Wait for it to close before unplugging the drive.", NOTA))
F.append(Paragraph("If Windows says it “protected your PC”", H2))
F.append(b("That is SmartScreen, and it says the same for any file downloaded from the internet — "
           "it is not a sign of a virus. Click <b>More info</b> and then <b>Run anyway</b>. "
           "Only ever do that with the file you copied yourself."))

# ---------- 6 ----------
capitulo(6, "How to know it is up")
F.append(b("There are two places to check, and they tell you the same thing:"))
F.append(bullets([
    "<b>On the site</b>, in the creator panel: the server card shows on or off, how many videos "
    "it found and whether FFmpeg is working. It checks again by itself every 20 seconds.",
    "<b>In the browser</b>, by opening the address below. If you get back text starting with "
    "<font name='MONO'>{\"ok\":true</font>, it is working.",
]))
F.append(code("http://localhost:8787/api/saude"))
F.append(Paragraph("Off is a normal state", H2))
F.append(b("A grey card is not an error. It only means the drive is not plugged in, or the black "
           "window is not open. You can carry on editing the course as usual — the only thing "
           "unavailable is what comes from the shelf."))

# ---------- 7 ----------
capitulo(7, "The folder is the shelf: how to arrange the files")
F.append(b("Here is the trick that saves the most time: <b>there is no upload form.</b> "
           "You arrange the shelves in Windows Explorer, which you already know how to use, "
           "and the caretaker reads that arrangement. The order of the folders becomes the "
           "order of the course."))
F.append(code(
    "midia/\n"
    "└── curso-bioressonancia/\n"
    "    ├── capa.jpg\n"
    "    ├── 01-fundamentos/\n"
    "    │   ├── 01-o-que-e.mp4      ← the lesson\n"
    "    │   ├── 01-o-que-e.jpg      ← thumbnail (optional)\n"
    "    │   ├── 01-o-que-e.pt.vtt   ← subtitles (the caretaker writes them)\n"
    "    │   └── 01-o-que-e.json     ← the file card (the caretaker writes it)\n"
    "    └── 02-pratica/"))
F.append(Paragraph("Four agreements that save you trouble", H2))
F.append(bullets([
    "<b>Start the name with a number</b> — 01, 02, 03. That is what sets the order of the lessons.",
    "<b>No accents and no spaces in the file name.</b> Use hyphens: "
    "<font name='MONO'>01-o-que-e.mp4</font>. The pretty title you write on the site.",
    "<b>Thumbnail with the same name as the video</b>, ending in .jpg. If you skip it, "
    "it grabs a frame from the video and uses that.",
    "<b>Export as MP4, H.264 and AAC.</b> Then it plays in any browser, phone and TV, "
    "with no conversion at all.",
]))
F.append(Paragraph("The <b>.json</b> file next to the video is its card: it holds the identifier "
                   "of that lesson. That is what makes the drive genuinely portable — take it to "
                   "another computer and the link rebuilds itself.", NOTA))

# ---------- 8 ----------
capitulo(8, "Running a scan: files become lessons")
F.append(b("Scanning is the caretaker walking the whole shelf and comparing it with what it "
           "already knew. That is what turns a file into a lesson."))
F.append(passos([
    "Drop the new files into the right folder, in Explorer.",
    "With the server running, open the creator panel on the site.",
    "Click <b>look for new items</b> on the server card.",
    "It shows how many new items it found. Check them and confirm.",
]))
F.append(b("During the scan it does three things at once: it reads the length of each video, "
           "makes any missing thumbnail and writes the .json card next to the file."))
F.append(Paragraph("A large video can take a few seconds to produce its thumbnail. Scanning a "
                   "whole archive for the first time can take minutes: let it run.", NOTA))
F.append(Paragraph("Renaming and moving", H2))
F.append(b("You can rename, you can move to another folder. Because the link is through the "
           ".json card and not through the path, the caretaker finds the lesson again on the next "
           "scan. What you must <b>not</b> do is delete the .json along with it — then it starts "
           "treating the file as a brand new item."))

# ---------- 9 ----------
capitulo(9, "Subtitles: the server writes them, the site only fetches")
F.append(b("Subtitles are born on your machine, not on the site. The caretaker listens to the "
           "audio of the video and writes a <font name='MONO'>.vtt</font> file with the timing of "
           "<b>every word</b> — that is what lets the text follow the speech."))
F.append(passos([
    "Leave the server running.",
    "On the site, open the lesson in the editor and go to the subtitles tab.",
    "Click <b>pull subtitles from the drive</b>. If the file name matches, it is suggested for you.",
    "The subtitles land in the editor. Review them, fix whatever the speech swallowed, and save.",
    "For the English version, use <b>translate</b>: the timings are preserved.",
]))
F.append(Paragraph("Why not transcribe on the site: the site's transcription would get the timing "
                   "right only in blocks of 5 to 10 seconds, never word by word, and it would burn "
                   "credits on top. The caretaker does it better, and for free.", NOTA))

# ---------- 10 ----------
capitulo(10, "PDF pages become lesson material")
F.append(b("A handout in PDF or a slide deck in PPTX does not need to be opened in a heavy reader. "
           "The caretaker splits the document into <b>one image per page</b>, in order."))
F.append(passos([
    "Put the PDF in the lesson folder, next to the video.",
    "Run a scan: it counts the pages and renders each one.",
    "In the lesson editor, on the materials tab, click <b>pull pages from the drive</b>.",
    "Pick the document and confirm. The pages go up one by one, in order, and become "
    "lesson material.",
]))
F.append(b("Each page becomes a separate material, named after the document and the page number. "
           "A 40-page document produces 40 materials: it is worth checking that this is really "
           "what you want before you send it."))

# ---------- 11 ----------
capitulo(11, "When it does not work: six common problems")

H2P = ParagraphStyle("H2P", parent=H2, spaceBefore=7, spaceAfter=3)

def problema(titulo, sinal, causa, solucao):
    F.append(KeepTogether([Paragraph(titulo, H2P),
                           bullets([f"<b>What you see:</b> {sinal}",
                                    f"<b>Why it happens:</b> {causa}",
                                    f"<b>What to do:</b> {solucao}"])]))

problema("1. The black window opens and closes at once",
         "a flash on the screen and nothing else.",
         "the <font name='MONO'>node</font> folder is missing, or it has a different name.",
         "check that <font name='MONO'>servidor/node/node.exe</font> exists. A capital "
         "letter, or a version number in the name, will not do.")
problema("2. The card on the site stays grey",
         "the server running and the site saying it is not.",
         "the Firewall blocked it, or the browser is on another machine.",
         "allow it on the private network and open "
         "<font name='MONO'>http://localhost:8787/api/saude</font> on that same computer.")
problema("3. The drive letter changed",
         "yesterday it was E:, today it is F:, and nothing is found.",
         "Windows hands out the letter in order of arrival.",
         "the start-up file works the letter out by itself, as long as you run the "
         "<font name='MONO'>.bat</font> from inside the drive.")
problema("4. It says FFmpeg is not available",
         "videos show up, but with no thumbnail and no length.",
         "<font name='MONO'>ffmpeg.exe</font> or <font name='MONO'>ffprobe.exe</font> is missing.",
         "both files must sit in <font name='MONO'>servidor/ffmpeg/</font> — two, not one.")
problema("5. Port 8787 is already in use",
         "an error as soon as the black window opens.",
         "an older window is open, or another program took the port.",
         "close the other black windows and open it again; if it persists, restart.")
problema("6. The video shows in the list but will not play",
         "a black player or a format error.",
         "the file is not MP4 with H.264 and AAC.",
         "export it again in that format. It is quicker than any conversion on the fly.")

# ---------- 12 ----------
capitulo(12, "Upkeep: what to do every week and every month")
F.append(Paragraph("Every week", H2))
F.append(bullets([
    "Run a <b>scan</b> after any new file.",
    "Check the <b>free space</b> on the drive. Video fills it fast.",
    "Always unplug with <b>safely eject</b>, and only with the black window closed.",
]))
F.append(Paragraph("Every month", H2))
F.append(bullets([
    "<b>Update the backup.</b> Three copies is the target.",
    "Check that the <font name='MONO'>.json</font> cards are still next to the videos.",
    "Keep a copy of <font name='MONO'>biblioteca.db</font> somewhere off the drive.",
]))
F.append(Paragraph("The mirroring trap", H2))
F.append(b("Folder mirroring tools (FreeFileSync, robocopy /MIR) delete at the destination "
           "whatever disappeared at the source. If a file becomes corrupt or is deleted by "
           "accident, the next mirror run <b>carries the damage into the backup</b>."))
F.append(Paragraph("Hence the house rule: <b>one of the three copies is never mirrored "
                   "automatically.</b> It is updated by hand, now and then. That is what makes it "
                   "a backup rather than a copy of the same mistake.", NOTA))

# ---------- 13 ----------
capitulo(13, "Taking the drive to another computer")
F.append(b("It was built for that. The parts live inside the drive, so the other computer "
           "needs no preparation at all."))
F.append(passos([
    "Close the black window and safely eject the drive.",
    "Plug it into the other computer.",
    "Double-click <font name='MONO'>INICIAR-SERVIDOR.bat</font>.",
    "Allow it in the Firewall, if it asks. It is the first time on that machine.",
    "Run a scan once, to be safe.",
]))
F.append(b("The drive letter will change, and that is no problem: lessons are linked through the "
           "<font name='MONO'>.json</font> card, not through the path."))

# ---------- 14 ----------
capitulo(14, "Words you will meet along the way")
glos = [
    ("server", "the program that reads the shelf and hands over whatever is asked for. "
               "Here, the caretaker."),
    ("port 8787", "the number of the counter where the caretaker serves, on your computer."),
    ("localhost", "means “this machine here”. It only works on the computer where it runs."),
    ("scan", "walking the shelf and comparing it with the catalogue."),
    ("FFmpeg / FFprobe", "the two tools that read video: one makes the image, the other "
                         "reports length and format."),
    ("Node", "the engine that makes the caretaker's program run."),
    (".vtt", "the subtitle file, holding the text and the timing of each stretch."),
    (".json", "the card for a file, kept right next to it."),
    ("MP4 / H.264 / AAC", "the video format that plays everywhere without conversion."),
    ("SmartScreen", "the Windows warning for a file that came from the internet. "
                    "A warning, not a diagnosis."),
]
linhas = [[Paragraph(f"<b>{a}</b>", P), Paragraph(d, P)] for a, d in glos]
tb = Table(linhas, colWidths=[38*mm, 116*mm])
tb.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"),
                        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
                        ("TOPPADDING", (0,0), (-1,-1), 6),
                        ("LINEBELOW", (0,0), (-1,-2), 0.4, colors.HexColor("#e2ded2"))]))
F.append(tb)
F.append(Spacer(1, 8*mm))
F.append(Paragraph("Stuck on something this manual did not solve? Write down which step you "
                   "stopped at and what appeared on the screen — with those two pieces of "
                   "information, the fix usually takes minutes.", NOTA))

def rodape(canvas, doc):
    canvas.saveState()
    canvas.setFont("DJ", 8)
    canvas.setFillColor(SUAVE)
    if doc.page > 1:
        canvas.drawString(28*mm, 14*mm, "The server manual · Flor de Plasma")
        canvas.drawRightString(182*mm, 14*mm, str(doc.page))
    canvas.restoreState()

doc = SimpleDocTemplate("/tmp/manual-do-servidor-en.pdf", pagesize=A4,
                        leftMargin=28*mm, rightMargin=28*mm,
                        topMargin=24*mm, bottomMargin=22*mm,
                        title="The server manual", author="Flor de Plasma")
doc.build(F, onFirstPage=rodape, onLaterPages=rodape)
print("ok")
