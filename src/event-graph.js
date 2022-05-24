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

add_export("event_graph",function( statistics, theme, lines ) {

    if ( !lines ) lines = ["wake","asleep","sleep","day-length"];

    if ( !(
        statistics.schedule.wake &&
        statistics.schedule.sleep &&
        statistics.summary_asleep &&
        statistics.summary_days
    ) ) {
        return '';
    }

    const LH4 = LINE_HEIGHT/4,
          LH2 = LINE_HEIGHT/2,
          available_icons = {
              "wake": [
                  "wake",
                  'Wake at',
                  // triangle pointing up:
                  -LH4,LH4,
                  ' h '  + LH2 +
                  ' l ' + (-LH4) + ',' + (-LH2),
              ],
              "sleep": [
                  "sleep",
                  'Fall-asleep at',
                  // triangle pointing down:
                  -LH4,-LH4,
                  ' h '  + LH2 +
                  ' l ' + -LH4 + ',' + LH2,
              ],
              "asleep": [
                  "asleep",
                  'Sleep length',
                  // rhombus:
                  -LH4,0,
                  ' l '  + ( LH4) + ',' + ( LH4) +
                  ' l '  + ( LH4) + ',' + (-LH4) +
                  ' l '  + (-LH4) + ',' + (-LH4)
              ],
              "day-length": [
                  "day-length",
                  'Day length',
                  // rhombus:
                  -LH4,0,
                  ' l '  + ( LH4) + ',' + ( LH4) +
                  ' l '  + ( LH4) + ',' + (-LH4) +
                  ' l '  + (-LH4) + ',' + (-LH4)
              ],
          },
          available_series = {
              "wake": statistics.schedule.wake,
              "sleep": statistics.schedule.sleep,
              "asleep": statistics.summary_asleep,
              "day-length": statistics.summary_days,
          },
          icons = lines.map( line => available_icons[line] ),
          series = lines.map( line => available_series[line] ),
          day_lengths = statistics.summary_days.durations.filter( d => d ).sort( (a,b) => a-b ),
          graph_notch_max = Math.ceil( // whole number of pairs of hours
              day_lengths[ Math.floor( day_lengths.length * 0.95 ) ]
              / (2*ONE_HOUR)
          ),
          duration_str = d => {
              const hours = Math.floor(d/(60*60*1000));
              d %= (60*60*1000);
              const minutes = Math.floor(d/(60*1000));
              d %= (60*1000);
              const seconds = Math.floor(d/1000);
              let ret = [];
              switch ( hours ) {
              case 0:
                  break;
              case 1:
                  ret.push( '1 hour' );
                  break;
              default:
                  ret.push( hours + ' hours' );
              }
              switch ( minutes ) {
              case 0:
                  break;
              case 1:
                  ret.push( '1 minute' );
                  break;
              default:
                  ret.push( minutes + ' minutes' );
              }
              if ( !hours ) {
                  switch ( seconds ) {
                  case 0:
                      break;
                  case 1:
                      ret.push( '1 second' );
                      break;
                  default:
                      ret.push( seconds + ' seconds' );
                  }
              }
              return ret.join( ' and ' );
          },
          time_formatter = new Intl.DateTimeFormat(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
              hour: 'numeric',
              minute: 'numeric',
              timeZone: "Etc/GMT",
          }),
          max_point = graph_notch_max * 2*ONE_HOUR,
          graph_range = graph_notch_max*LINE_HEIGHT,
          graph_top = LH2,
          graph_bottom = graph_top + graph_range,
          graph_left = 30,
          graph_width = 555
    ;

    Object.keys(available_series).forEach( key => {
        switch ( key ) {
        case 'wake':
            available_series[key].titles = available_series[key].timestamps.map( t => 'Woke up ' + time_formatter.format(t) );
            break;
        case 'sleep':
            available_series[key].titles = available_series[key].timestamps.map( t => 'Fell asleep ' + time_formatter.format(t) );
            break;
        case 'asleep':
            available_series[key].titles = available_series[key].durations.map( t => 'Slept for ' + duration_str(t) );
            break;
        default: // day-length
            available_series[key].titles = available_series[key].durations.map( t => 'Day lasted ' + duration_str(t) );
        }
    });

    let ret = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ' + ((graph_notch_max+5)*LINE_HEIGHT) + '" class="event-graph ' + (theme||'') + '">'
      + '<style>'

      + 'svg.event-graph{max-width:100%;max-height:100%;background:white}'
      + '.event-graph text{font-family:sans-serif;font-size:' + (LINE_HEIGHT-4) + 'px;fill:black}'
      + '.event-graph .axes{fill:none;stroke:black}'
      + '.event-graph .notch{stroke-dasharray:4;stroke:black}'

      + '.event-graph .wake{fill:#AA9739;opacity:0.5}'
      + '.event-graph .sleep{fill:#2D882D;opacity:0.5}'
      + '.event-graph .asleep{fill:#8888BB;opacity:0.5}'
      + '.event-graph .day-length{fill:#AA3939;opacity:0.5}'

      + '.event-graph .line{fill:none;stroke-width:2px}'
      + '.event-graph .wake-avg{stroke:#AA9739}'
      + '.event-graph .sleep-avg{stroke:#88CC88}'
      + '.event-graph .asleep-avg{stroke:#9775AA}'
      + '.event-graph .day-length-avg{stroke:#FFAAAA}'

      + '.event-graph .overlay{opacity:0.25}'
      + '.event-graph .column{transform-box:fill-box;transform:rotate(45deg)}'

      // animation:
      + '@keyframes highlighted{to{stroke-dashoffset:-8px}}'
      + '.highlighted{stroke-dasharray:4;animation:0.75s infinite linear highlighted;font-weight:bold}'

      // dark theme:
      + '.event-graph.dark{background:#3F3F3F}'
      + '.event-graph.dark text{fill:white}'
      + '.event-graph.dark .chart-sleep{fill:#0000FF;stroke:#6666CC}'
      + '.event-graph.dark .axes,.event-graph .notch{stroke:white}'
      + '.event-graph.dark .wake-avg{stroke:#FFF0AA}'
      + '.event-graph.dark .asleep-avg{stroke:#B494C6}'
      + '.event-graph.dark .asleep{fill:#7C35AC}'

      + '</style>'

      + '<path class="axes" d="M' + graph_left + ' ' + graph_top + ' v ' + graph_range + ' h ' + graph_width + '"/>'
    ),
        columns = statistics.activities,
        column_width = graph_width / ( columns.length-1),
        current_column = 0,
        column_pos = timestamp => {
            while ( current_column < columns.length && (columns[current_column]||{end:0}).end <= timestamp ) {
                ++current_column;
            }
            return graph_left + column_width*current_column;
        },
        column_filter = () => 1,
        date_formatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }),
        disallowed_column = -1,
        prev_column = { day: NaN, month: NaN }
    ;

    // draw horizontal markers:
    for ( let n=0; n<=graph_notch_max; ++n ) {
        ret += '<text x="' + (graph_left-5) + '" y="' + ((n+1)*LINE_HEIGHT-3) + '" text-anchor="end">' + (graph_notch_max-n)*2 + '</text>'
    }
    // draw horizontal lines:
    for ( let n=1; n<graph_notch_max; ++n ) {
        ret += '<line class="notch" x1="' + graph_left + '" y1="' + (graph_top+n*LINE_HEIGHT) + '" x2="' + (graph_left+graph_width) + '" y2="' + (graph_top+n*LINE_HEIGHT) + '" />';
    }

    if ( columns.length < 15 ) {
        // nothing to do
    } else if ( columns.length < 30 ) {
        column_filter = (p,c,n) => !(n%2);
    } else if ( columns.length < 60 ) {
        column_filter = (p,c,n) => !(n%3);
    } else if ( columns.length < 90 ) {
        column_filter = (p,c,n) => !(n%4);
    } else if ( columns.length < 365*2 ) {
        column_filter = (p,c) => p.month != c.month;
        date_formatter = new Intl.DateTimeFormat(undefined, { month: 'short' });
    } else if ( columns.length < 365*5 ) {
        column_filter = (p,c) => Math.floor(p.month/3) != Math.floor(c.month/3);
        date_formatter = new Intl.DateTimeFormat(undefined, { month: 'short', year: '2-digit' });
        disallowed_column = 1;
    } else {
        column_filter = (p,c) => p.year != c.year;
        date_formatter = new Intl.DateTimeFormat(undefined, { year: '2-digit' });
        disallowed_column = 1;
    }

    // draw vertical lines:
    columns.forEach( (column,n) => {
        if ( column && column_filter(prev_column,column,n) ) {
            prev_column = column;
            if ( n ) {
                ret += '<line class="notch" x1="' + (graph_left+(n/(columns.length-1))*graph_width) + '" y1="' + graph_top + '" x2="' + (graph_left+(n/(columns.length-1))*graph_width) + '" y2="' + (graph_top+graph_range) + '" />';
            }
            if ( n != disallowed_column ) {
                ret += '<text class="column" x="' + (graph_left+(n/(columns.length-1))*graph_width) + '" y="' + (graph_bottom+LINE_HEIGHT) + '">' + date_formatter.format(new Date(column.start)) + '</text>'
            }
        }
    });

    return (

        ret

        + series.map( (s,n) => {
            const icon = icons[n];
            current_column = 0;
            return (
              // legend:
                '<g '
                    + ' class="' + icon[0] + '-legend" '
                    + 'onmouseover="'
                    +   '{var elements=document.getElementsByClassName(\''+icon[0]+'-avg\');'
                    +   'for(var n=0;n!=elements.length;++n)elements[n].className.baseVal+=\' highlighted\'}'
                    + '" '
                    + 'onmouseout="'
                    +   '{var elements=document.getElementsByClassName(\''+icon[0]+'-avg\');'
                    +   'for(var n=0;n!=elements.length;++n)elements[n].className.baseVal=elements[n].className.baseVal.replace(/ highlighted/,\'\')}'
                    + '">'
                + '<path class="' + icon[0] + '" ' + 'd="M ' + (75 + n*125 + icon[2]) + ',' + (graph_bottom+LINE_HEIGHT*3+icon[3]) + icon[4] + ' z" />'
                + '<text x="' + (85 + n*125) + '" y="' + (graph_bottom+LINE_HEIGHT*3+4) + '">' + icon[1] + '</text>'
                + '</g>'
            ) + s.durations.map( (d,n) =>
                // underlay data points:
                d
                ? ( '<path class="' + icon[0] + '" '
                  + 'd="'
                  + 'M ' + ( column_pos(s.timestamps[n]) + icon[2]) + ',' + (graph_bottom - graph_range * d/max_point + icon[3])
                  + icon[4]
                  + ' z" />'
                )
                : ''
            ).join('')
        }).join()

        + series.map( (s,n) => {
            // overlay data points:
            const icon = icons[n];
            current_column = 0;
            return s.durations.map( (d,n) =>
                d
                ? ( '<path class="' + icon[0] + ' overlay" '
                  + 'd="'
                  + 'M ' + ( column_pos(s.timestamps[n]) + icon[2]) + ',' + (graph_bottom - graph_range * d/max_point + icon[3])
                  + icon[4]
                  + ' z">'
                  + '<title>' + s.titles[n] + '</title>'
                  + '</path>'
                )
                : ''
            ).join('')
        }).join()

        + series.map( (s,n) => {
            current_column = 0;
            let separator = '',
                total = s.rolling_average.length,
                prev = 12*ONE_HOUR,
                prev_column = current_column
            ;
            return (
                '<path class="line ' + icons[n][0] + '-avg" '
                + 'onmouseover="'
                +   '{var elements=document.getElementsByClassName(\''+icons[n][0]+'-legend\');'
                +   'for(var n=0;n!=elements.length;++n)elements[n].className.baseVal+=\' highlighted\'}'
                + '" '
                + 'onmouseout="'
                +   '{var elements=document.getElementsByClassName(\''+icons[n][0]+'-legend\');'
                +   'for(var n=0;n!=elements.length;++n)elements[n].className.baseVal=elements[n].className.baseVal.replace(/ highlighted/,\'\')}'
                + '" '
                + 'd="M '
                + s.rolling_average.map( (average,n) => {
                    if ( average === undefined ) return '';
                    const x = column_pos(s.timestamps[n]);
                    if ( separator && (
                        Math.abs( prev - average ) > 12*ONE_HOUR || // Y gap is too large
                        prev_column < current_column-7 // X gap is too large
                    )
                       ) {
                        separator = " M ";
                    }
                    prev = average;
                    prev_column = current_column;
                    const ret = separator + x + ' ' + (graph_bottom - graph_range * average/max_point)
                    ;
                    separator = ' L ';
                    return ret;
                }).join('')
                + '"/>'
            );
        }).join('')

        + '</svg>'

    );

});
