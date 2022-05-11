#!/bin/bash
#Setup CLASSPATH to include all files in 'lib' folder.
#Change value of 'libs_path' variable to use a different location for libraries.

export libs_path="$(pwd)/WEB-INF/lib/"
export classes="$(pwd)/WEB-INF/classes/"
export sources="$(pwd)/WEB-INF/src/lightbot/"
export libs=$(find "$libs_path" -type f)
export libs_conc=$(sed ':a;N;$!ba;s/\n/:/g'  <<< "$libs")
##export authentication_path="$(pwd)/../authentication/WEB-INF/classes/"
export CLASSPATH="$classes:$libs_conc" ## :$authentication_path"

rm -rf $classes/*

echo "CLASSPATH=$CLASSPATH" ##debug**
javac -d "$classes"  $sources*.java
echo -e "\nBuild complete."


