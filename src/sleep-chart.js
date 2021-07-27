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

add_export("sleep_chart",function( statistics ) {

    const activities = statistics.activities,
          bottom = (activities.length-1) * LINE_HEIGHT + TEXT_OFFSET;

    return [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ' + (activities.length*LINE_HEIGHT) + '" style="width:100%;height:auto;background:#3F3F3F">'
        + '<style>'
        + 'text{font-size:' + (LINE_HEIGHT-4) + 'px;fill:white}'
        + '.notch{stroke-dasharray:4;stroke:#7F7F7F}'
        + '.day-0,.day-6{font-weight:bold}'
        + '.chart-sleep{fill:#0000FF;stroke:#0000CC}'
        + '.chart-sleep-overlay{opacity: 0.5}'
        + '</style>'
    ].concat(
        activities.slice(0).reverse().map( (day,n) => {
            const y = n*LINE_HEIGHT,
                  date = day["id"].split("T")[0],
                  date_obj = new Date(date + "T00:00:00.000Z")
            ;
            return (
                (n?'<line class="notch" x1="0" y1="'+y+'" x2="600" y2="'+y+'"/>':'')
                    + '<text class="date day-'+date_obj.getUTCDay()
                    + '" text-anchor="end" x="44" y="'+(y+TEXT_OFFSET)+'">'
                    + new Intl.DateTimeFormat(undefined, { "weekday": "short", "day": "numeric" } ).format(date_obj)
                    + '</text>'
                    + day.activities
                    .filter( a => a.record.status == "asleep" )
                    .map(
                        a => '<rect class="chart-sleep" x="' + (45+555*a.offset_start) + '" y="' + (y+3) + '" width="' +(45+555*(a.offset_end-a.offset_start)) + '" height="' + (LINE_HEIGHT-6) + '"/>'
                    ).join('')
            );
        }),
        [
            '<line x1="50" x2="50" y1="0" y2="' + bottom + '" class="notch" />' +
            '<line x1="183.75" x2="183.75" y1="0" y2="' + bottom + '" class="notch" />' +
            '<line x1="322.5" x2="322.5" y1="0" y2="' + bottom + '" class="notch" />' +
            '<line x1="461.25" x2="461.25" y1="0" y2="' + bottom + '" class="notch" />' +
            '<line x1="50" x2="50" y1="0" y2="' + bottom + '" class="notch" />' +
            '<line x1="595" x2="595" y1="0" y2="' + bottom + '" class="notch" />'
        ],
        activities.slice(0).reverse().map( (day,n) => {
            const y = n*LINE_HEIGHT;
            return (
                day.activities
                    .filter( a => a.record.status == "asleep" )
                    .map(
                        a => '<rect class="chart-sleep chart-sleep-overlay" x="' + (45+555*a.offset_start) + '" y="' + (y+3) + '" width="' +(45+555*(a.offset_end-a.offset_start)) + '" height="' + (LINE_HEIGHT-6) + '"/>'
                    ).join('')
            );
        }),
        [
            '<text x="50" y="'     + TEXT_OFFSET + '">6pm</text>' +
            '<text x="183.75" y="' + TEXT_OFFSET + '" text-anchor="middle">midnight</text>' +
            '<text x="322.5" y="'  + TEXT_OFFSET + '" text-anchor="middle">6am</text>' +
            '<text x="461.25" y="' + TEXT_OFFSET + '" text-anchor="middle">noon</text>' +
            '<text x="50" y="'     + TEXT_OFFSET + '">6pm</text>' +
            '<text x="595" y="'    + TEXT_OFFSET + '" text-anchor="end">6pm</text>' +

            '<text x="50" y="'     + bottom + '">6pm</text>' +
            '<text x="183.75" y="' + bottom + '" text-anchor="middle">midnight</text>' +
            '<text x="322.5" y="'  + bottom + '" text-anchor="middle">6am</text>' +
            '<text x="461.25" y="' + bottom + '" text-anchor="middle">noon</text>' +
            '<text x="595" y="'    + bottom + '" text-anchor="end">6pm</text>'
        ],
    ).join('') + (

        '</svg>'
    );
});
