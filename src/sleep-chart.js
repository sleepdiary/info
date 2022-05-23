/**
 * Create a sleep chart
 *
 * @copyright Copyright 2020-2021 Sleep Diary Authors <sleepdiary@pileofstuff.org>
 *
 * @license
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

add_export("sleep_chart",function( activities, theme, start_at_midnight, timezone ) {

    const bottom = (activities.length-1) * LINE_HEIGHT + TEXT_OFFSET;

    let header = [], body = [], prev_day,
        headings = [
            [ '6pm'     , 50     , '' ],
            [ 'midnight', 183.75 , ' text-anchor="middle"' ],
            [ '6am'     , 322.5  , ' text-anchor="middle"' ],
            [ 'noon'    , 461.25 , ' text-anchor="middle"' ],
        ],
        month_backgrounds = [],
        month_labels = [],
        prev_month_boundary = 0,
        prev_month_string = '',
        prev_month = -1,
        // this formatter uses real times:
        time_formatter       = new Intl.DateTimeFormat(undefined, { timeZone: timezone, timeStyle: 'long', }),
        // these formatters use timezoneless inputs:
        date_formatter_short = new Intl.DateTimeFormat(undefined, { timeZone: "Etc/GMT", weekday: "short", day: "numeric", } ),
        date_formatter_long  = new Intl.DateTimeFormat(undefined, { timeZone: "Etc/GMT", year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', }),
        month_formatter      = new Intl.DateTimeFormat(undefined, { timeZone: "Etc/GMT", year: "numeric", month: 'long', } )
    ;

    function add_month(y,n) {
        month_backgrounds.push('<rect class="month month-' + (month_backgrounds.length%2) + '" x="0" y="' + prev_month_boundary + '" width="600" height="' + (y-prev_month_boundary) + '"/>');
        if ( prev_month_boundary && n!=activities.length-1 ) {
            month_labels.push(
                '<text class="shadow" text-anchor="end" x="591" y="' + (prev_month_boundary+TEXT_OFFSET+1) + '">' + prev_month_string + '</text>' +
                '<text class="month month-' + (month_backgrounds.length%2) + '" text-anchor="end" x="590" y="' + (prev_month_boundary+TEXT_OFFSET) + '">' + prev_month_string + '</text>'
            );
        }
    }

    if ( start_at_midnight ) {
        const title_0 = headings[0][0];
        for ( let n=1; n!=headings.length; ++n ) {
            headings[n-1][0] = headings[n][0];
        }
        headings[headings.length-1][0] = title_0;
    }
    headings.push([ headings[0][0], 595, ' text-anchor="end"' ]);

    for ( let n=0; n!=activities.length; ++n ) {
        const day = activities[activities.length-1-n],
              y = n*LINE_HEIGHT
        ;

        if ( n && (day||prev_day) ) {
            header.push('<line class="notch" x1="0" y1="'+y+'" x2="600" y2="'+y+'"/>')
        }

        if ( day ) {

            const date = day["id"].split(/[T-]/),
                  date_obj = new Date(date[0],date[1]-1,date[2]),
                  sleeps = day.activities.filter(
                      a => a.record.status == "asleep" && a.record.start && a.record.end
                  )
                  ;

            if ( prev_month != date_obj.getFullYear()*12 + date_obj.getMonth() ) {
                add_month(y,n);
                prev_month = date_obj.getFullYear()*12 + date_obj.getMonth();
                prev_month_string = month_formatter.format(date_obj);
                prev_month_boundary = y;
            }

            header.push(
                '<text class="date day-'+date_obj.getDay()
                    + '" text-anchor="end" x="44" y="'+(y+TEXT_OFFSET)+'">'
                    + date_formatter_short.format(date_obj)
                    + '<title>' + date_formatter_long.format(date_obj) + '</title>'
                    + '</text>'
                    + sleeps.map(
                        a => '<rect class="chart-sleep" x="' + (45+555*a.offset_start) + '" y="' + (y+3) + '" width="' +(555*(a.offset_end-a.offset_start)) + '" height="' + (LINE_HEIGHT-6) + '"/>'
                    ).join('')
            );

            body.push(
                sleeps
                    .map(
                        a =>
                        '<rect class="chart-sleep chart-sleep-overlay" x="' + (45+555*a.offset_start) + '" y="' + (y+3) + '" width="' +(555*(a.offset_end-a.offset_start)) + '" height="' + (LINE_HEIGHT-6) + '">'
                            + '<title>' + time_formatter.format(new Date(a.record.start)) + ' - ' + time_formatter.format(new Date(a.record.end)) + '</title>'
                        + '</rect>'
                    ).join('')
            );

            prev_day = true;

        } else {

            header.push(
                '<text class="date day-missing'
                    + '" text-anchor="end" x="30" y="'+(y+TEXT_OFFSET)+'">&#183;&#183;&#183;'
                    + '<title>no data for this day</title>'
                    + '</text>'
            );

            prev_day = false;

        }
    }

    add_month(activities.length*LINE_HEIGHT,prev_month_boundary/LINE_HEIGHT);

    return [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ' + (activities.length*LINE_HEIGHT) + '" class="sleep-chart ' + (theme||'') + '">'

        + '<style>'
        + 'svg.sleep-chart{width:100%;height:auto}'
        + '.sleep-chart text{font-family:sans-serif;font-size:' + (LINE_HEIGHT-4) + 'px;fill:black}'
        + '.sleep-chart text.heading,.sleep-chart text.month{fill:#ddd}'
        + '.sleep-chart text.month.month-0{fill:white}'
        + '.sleep-chart text.shadow{fill:black}'
        + '.sleep-chart .notch{stroke-dasharray:4;stroke:#7F7F7F}'
        + '.sleep-chart .day-0,.day-6{font-weight:bold}'
        + '.sleep-chart .day-missing{opacity: 0.5}'
        + '.sleep-chart .chart-sleep{fill:#0000FF;stroke:#6666CC}'
        + '.sleep-chart .chart-sleep-overlay{opacity: 0.5}'
        + '.sleep-chart .month-0 { fill: white }'
        + '.sleep-chart .month-1 { fill: #AAA }'

        // dark theme:
        + '.sleep-chart.dark .month-0 { fill: #3F3F3F }'
        + '.sleep-chart.dark .month-1 { fill: #2F2F2F }'
        + '.sleep-chart.dark text,.sleep-chart.dark text.heading,.sleep-chart.dark text.month{fill:white}'
        + '.sleep-chart.dark text.shadow{fill:none}'

        + '</style>'
    ].concat(
        month_backgrounds,
        header,
        [
            '<line class="notch" x1="50" x2="50" y1="0" y2="'         + bottom + '" />' +
            '<line class="notch" x1="183.75" x2="183.75" y1="0" y2="' + bottom + '" />' +
            '<line class="notch" x1="322.5" x2="322.5" y1="0" y2="'   + bottom + '" />' +
            '<line class="notch" x1="461.25" x2="461.25" y1="0" y2="' + bottom + '" />' +
            '<line class="notch" x1="50" x2="50" y1="0" y2="'         + bottom + '" />' +
            '<line class="notch" x1="595" x2="595" y1="0" y2="'       + bottom + '" />'
        ],
        body,
        month_labels,
        headings.map( heading =>
            '<text class="shadow" x="' + (heading[1]+1) + '" y="' + (TEXT_OFFSET+1) + '"' + heading[2] + '>' + heading[0] + '</text>' +
            '<text class="shadow" x="' + (heading[1]+1) + '" y="' + (bottom+1)      + '"' + heading[2] + '>' + heading[0] + '</text>' +
            '<text class="heading" x="' + heading[1] + '" y="' + TEXT_OFFSET + '"' + heading[2] + '>' + heading[0] + '</text>' +
            '<text class="heading" x="' + heading[1] + '" y="' + bottom      + '"' + heading[2] + '>' + heading[0] + '</text>'
        ),
    ).join('') + (

        '</svg>'
    );
});
