# Sleep Diary Info

Tools to improve your understanding of sleep:

* [detect common sleeping patterns](src/patterns.js)
* [generate a prediction spreadsheet](src/prediction-spreadsheet.js)
* [generate a sleep chart](src/sleep-chart.js)
* [generate a graph of sleep-related events](src/event-graph.js)

[The wiki](https://github.com/sleepdiary/info/wiki) has more information about how to manage your sleeping pattern.

## Developing the project

The recommended way to recompile the project is to [install Docker](https://docs.docker.com/get-started/) and do:

    # build and test:
    docker run --rm -it -v "/path/to/sleepdiary/info":/app sleepdiaryproject/builder
    # build but don't test:
    docker run --rm -it -v "/path/to/sleepdiary/info":/app sleepdiaryproject/builder build
    # rebuild whenever files change:
    docker run --rm -it -v "/path/to/sleepdiary/info":/app sleepdiaryproject/builder run

This is run automatically by [our GitHub Actions script](.github/workflows/main.yml).  If you fork this project on GitHub, [enable GitHub Actions](https://docs.github.com/en/actions/managing-workflow-runs/disabling-and-enabling-a-workflow) to rebuild the project automatically whenever you push a change.

## License

Sleep Diary Info, Copyright © 2021 Sleepdiary Developers <sleepdiary@pileofstuff.org>

Sleep Diary Info comes with ABSOLUTELY NO WARRANTY.  This is free software, and you are welcome to redistribute it under certain conditions.  For details, see [the license statement](LICENSE).
