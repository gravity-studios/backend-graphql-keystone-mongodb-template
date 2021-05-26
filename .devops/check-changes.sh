#!/usr/bin/env bash

git diff --name-only --diff-filter=ADMR @~..@ | grep -q $1
retVal=$?

if [ $DEBUG ]
then
  echo "git command retVal : ${retVal}"
fi

exit $retVal