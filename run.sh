#!/bin/bash


restore=$(pwd)

cd images

node ../build/index.js | xargs -I {} curl {} -O 

for f in *.svg; 
do 
    mv $f $(echo $f |  sed -e 's/_[a-z0-9]\{4\}\.svg/.svg/')
done


cd $restore


