@echo off
echo ========================================================
echo Compiling AgriSense-Edge IEEE Academic Research Paper...
echo ========================================================

pdflatex -interaction=nonstopmode main.tex
if %errorlevel% neq 0 (
    echo Error in initial pdflatex run.
    exit /b %errorlevel%
)

bibtex main
if %errorlevel% neq 0 (
    echo Warning or error in bibtex run.
)

pdflatex -interaction=nonstopmode main.tex
pdflatex -interaction=nonstopmode main.tex

if exist main.pdf (
    copy /Y main.pdf AgriSense_Edge_Research_Paper.pdf
    echo ========================================================
    echo SUCCESS: AgriSense_Edge_Research_Paper.pdf compiled!
    echo ========================================================
) else (
    echo FAILED: main.pdf not found.
    exit /b 1
)
