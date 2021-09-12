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

add_export("sleep_chart",function( activities, theme, start_at_midnight ) {

    const bottom = (activities.length-1) * LINE_HEIGHT + TEXT_OFFSET;

    let header = [], body = [], prev_day,
        headings = ['6pm','midnight','6am','noon']
    ;

    if ( start_at_midnight ) {
        headings.push(headings.shift());
    }

    for ( let n=0; n!=activities.length; ++n ) {
        const day = activities[activities.length-1-n],
              y = n*LINE_HEIGHT
        ;

        if ( n && (day||prev_day) ) {
            header.push('<line class="notch" x1="0" y1="'+y+'" x2="600" y2="'+y+'"/>')
        }

        if ( day ) {

            const date = day["id"].split("T")[0],
                  date_obj = new Date(date + "T00:00:00.000Z")
            ;

            header.push(
                '<text class="date day-'+date_obj.getUTCDay()
                    + '" text-anchor="end" x="44" y="'+(y+TEXT_OFFSET)+'">'
                    + new Intl.DateTimeFormat(undefined, { "weekday": "short", "day": "numeric" } ).format(date_obj)
                    + '<title>' + new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(date_obj) + '</title>'
                    + '</text>'
                    + day.activities
                    .filter( a => a.record.status == "asleep" )
                    .map(
                        a => '<rect class="chart-sleep" x="' + (45+555*a.offset_start) + '" y="' + (y+3) + '" width="' +(45+555*(a.offset_end-a.offset_start)) + '" height="' + (LINE_HEIGHT-6) + '"/>'
                    ).join('')
            );

            body.push(
                day.activities
                    .filter( a => a.record.status == "asleep" )
                    .map(
                        a => '<rect class="chart-sleep chart-sleep-overlay" x="' + (45+555*a.offset_start) + '" y="' + (y+3) + '" width="' +(45+555*(a.offset_end-a.offset_start)) + '" height="' + (LINE_HEIGHT-6) + '"/>'
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

    return [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ' + (activities.length*LINE_HEIGHT) + '" class="sleep-chart ' + (theme||'') + '">'

        + '<style>'
        + 'svg.sleep-chart{width:100%;height:auto;background:white}'
        + '.sleep-chart text{font-family:sans-serif;font-size:' + (LINE_HEIGHT-4) + 'px;fill:black}'
        + '.sleep-chart .notch{stroke-dasharray:4;stroke:#7F7F7F}'
        + '.sleep-chart .day-0,.day-6{font-weight:bold}'
        + '.sleep-chart .day-missing{opacity: 0.5}'
        + '.sleep-chart .chart-sleep{fill:#CCCCFF;stroke:#AAAACC}'
        + '.sleep-chart .chart-sleep-overlay{opacity: 0.5}'

        // dark theme:
        + '.sleep-chart.dark{background:#3F3F3F}'
        + '.sleep-chart.dark text{fill:white}'
        + '.sleep-chart.dark .chart-sleep{fill:#0000FF;stroke:#6666CC}'

        + '</style>'
    ].concat(
        header,
        [
            '<line x1="50" x2="50" y1="0" y2="' + bottom + '" class="notch" />' +
            '<line x1="183.75" x2="183.75" y1="0" y2="' + bottom + '" class="notch" />' +
            '<line x1="322.5" x2="322.5" y1="0" y2="' + bottom + '" class="notch" />' +
            '<line x1="461.25" x2="461.25" y1="0" y2="' + bottom + '" class="notch" />' +
            '<line x1="50" x2="50" y1="0" y2="' + bottom + '" class="notch" />' +
            '<line x1="595" x2="595" y1="0" y2="' + bottom + '" class="notch" />'
        ],
        body,
        [
            '<text x="50" y="'     + TEXT_OFFSET + '">' + headings[0] + '</text>' +
            '<text x="183.75" y="' + TEXT_OFFSET + '" text-anchor="middle">' + headings[1] + '</text>' +
            '<text x="322.5" y="'  + TEXT_OFFSET + '" text-anchor="middle">' + headings[2] + '</text>' +
            '<text x="461.25" y="' + TEXT_OFFSET + '" text-anchor="middle">' + headings[3] + '</text>' +
            '<text x="595" y="'    + TEXT_OFFSET + '" text-anchor="end">' + headings[0] + '</text>' +

            '<text x="50" y="'     + bottom + '">' + headings[0] + '</text>' +
            '<text x="183.75" y="' + bottom + '" text-anchor="middle">' + headings[1] + '</text>' +
            '<text x="322.5" y="'  + bottom + '" text-anchor="middle">' + headings[2] + '</text>' +
            '<text x="461.25" y="' + bottom + '" text-anchor="middle">' + headings[3] + '</text>' +
            '<text x="595" y="'    + bottom + '" text-anchor="end">' + headings[0] + '</text>'
        ],
    ).join('') + (

        '</svg>'
    );
});
