# Sleep Diary Info

Tools to improve your understanding of sleep:

* [detect common sleeping patterns](src/patterns.js)
* [generate a prediction spreadsheet](src/prediction-spreadsheet.js)
* [generate a sleep chart](src/sleep-chart.js)
* [generate a graph of sleep-related events](src/event-graph.js)

[The wiki](https://github.com/sleepdiary/info/wiki) has more information about how to manage your sleeping pattern.

## Compiling this project

The included [`Dockerfile`](Dockerfile) describes our build environment.  To recompile the project, build and run the environment like this:

    docker build --tag sleepdiary-info "/path/to/sleepdiary/info"
    docker run --rm -it -v "/path/to/sleepdiary/info":/app sleepdiary-info

This is run automatically by [our GitHub Actions script](.github/workflows/main.yml).  If you fork this project on GitHub, [enable GitHub Actions](https://docs.github.com/en/actions/managing-workflow-runs/disabling-and-enabling-a-workflow) to rebuild the project automatically whenever you push a change.

## License

Sleep Diary Info, Copyright © 2021 Sleepdiary Developers <sleepdiary@pileofstuff.org>

Sleep Diary Info comes with ABSOLUTELY NO WARRANTY.  This is free software, and you are welcome to redistribute it under certain conditions.  For details, see [the license statement](LICENSE).
