/**
 * Create a sleep prediction spreadsheet
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

add_export("prediction_spreadsheet",function( workbook, statistics ) {

    const day_length = (statistics.summary_days||{}).average || 24*ONE_HOUR,
          time = new Date().getTime() - 86400000,
          asleep_at = (
              time
              - ( time % 86400000 ) // reset to midnight GMT
              + statistics.schedule.sleep.average // average day length
              + statistics.schedule.sleep.durations.length/2 * ( day_length - 24*ONE_HOUR ) // skew
          ),
          awake_at  = (
              time
              - ( time % 86400000 ) // reset to midnight GMT
              + statistics.schedule.wake .average + // average day length
              + statistics.schedule.wake.durations.length/2 * ( day_length - 24*ONE_HOUR ) // skew
              + ( // make sure sleep comes before wake
                  statistics.schedule.wake.average < statistics.schedule.sleep.average
              ) * 86400000
          ),
          estimate_interval = ONE_HOUR/2,
          one_day           = 24*ONE_HOUR,
          worksheet         = workbook.addWorksheet("Sleep diary"),
          settings = [
              [ "Average over this many days", statistics.schedule.sleep.timestamps.length-1 ],
              [ "Base uncertainty", estimate_interval / one_day ],
              [ "Daily uncertainty multiplier", 1.1 ],
              [ "Last recorded sleep", { formula: "=MAX(A:A)" } ],
              [ "Start of sleep-averaging period", { formula: "=VLOOKUP(J10-J7,A:A,1)" } ],
              [ "Average time between sleeps", { formula: "=(J10-J11)/J7" } ],
              [ "Last recorded wake", { formula: "=MAX(B:B)" } ],
              [ "Start of wake-averaging period", { formula: "=VLOOKUP(J13-J7,B:B,1)" } ],
              [ "Average time between wakes", { formula: "=(J13-J14)/J7" } ],
              [ "Average day length", { formula: "=(J12+J15)/2" } ],
          ],
          day_format = "ddd\\ MMM\\ D,\\ HH:MM",
          sleep_column = {
              width: 18,
              style: {
                  numFmt: day_format,
                  font: {
                      name: 'Calibri',
                      color: { argb: "FFFFFFFF" }
                  },
                  fill: {
                      type: "pattern",
                      pattern: "solid",
                      fgColor: {argb:"FF000040"},
                  },
              }
          },
          wake_column = {
              width: 18,
              style: {
                  numFmt: day_format,
                  font: {
                      name: 'Calibri',
                      color: { argb: "FF000000" }
                  },
                  fill: {
                      type: "pattern",
                      pattern: "solid",
                      fgColor: {argb:"FFFFFFD0"},
                  },
              },
          },
          sleep_prediction_column = JSON.parse(JSON.stringify(sleep_column)),
           wake_prediction_column = JSON.parse(JSON.stringify( wake_column)),

          heading_style = {
              font: {
                  name: 'Calibri',
                  bold: true,
              },
              fill: {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: {argb:"FFEEEEEE"},
              },
              alignment: {
                  vertical: "middle",
                  horizontal: "center"
              },
          },
          rows = [
              ["Asleep at","Awake at"]
          ].concat(
              statistics.schedule.sleep.timestamps.map( (v,n) => [
                  new Date(v),
                  new Date(statistics.schedule.wake.timestamps[n]),
                  undefined
              ])
          ),
          prediction_headers = [
              ["Predicted sleep time",undefined,"Predicted wake time",undefined,undefined,"Algorithm"],
              ["Earliest"            ,"Latest" ,"Earliest"           ,"Latest" ,undefined,"Value","Setting"]
          ],
          prediction_count = rows.length+Math.min( 14, statistics.schedule.sleep.timestamps.length-1 );
    ;

    sleep_prediction_column.style.fill.fgColor.argb = 'FF000080';
     wake_prediction_column.style.fill.fgColor.argb = 'FFFFFFE7';

    // set column styles:
    worksheet.columns = [
        sleep_column,
        wake_column,
        {},
        sleep_prediction_column, sleep_prediction_column,
        wake_prediction_column,  wake_prediction_column,
        {},
        { width: 18, style: { numFmt: day_format } },
        { width: 18, style: { numFmt: day_format } },
    ];

    // emphasise the border between the diary and prediction sections:
    worksheet.getColumn(3).border = { left : {style:'thin'} };

    // add predictions:
    prediction_headers.forEach( (row,n) => rows[n+4] = (rows[n+4]||[undefined,undefined,undefined]).concat(row) );

    // add predictions:
    for ( let n=6; n<prediction_count; ++n ) {
        rows[n] = (rows[n]||[undefined,undefined,undefined]).concat([
            { formula: "=IF(A"+(n+1)+",A"+(n+1)+",D"+(n)+"+$J$16-$J$8*$J$9)" },
            { formula: "=IF(A"+(n+1)+",A"+(n+1)+",E"+(n)+"+$J$16+$J$8*$J$9)" },
            { formula: "=IF(B"+(n+1)+",B"+(n+1)+",F"+(n)+"+$J$16-$J$8*$J$9)" },
            { formula: "=IF(B"+(n+1)+",B"+(n+1)+",G"+(n)+"+$J$16+$J$8*$J$9)" },
        ]);
    }

    // add settings:
    settings.forEach( (v,n) => {
        rows[n+6][8] = v[0];
        rows[n+6][9] = v[1];
    });

    // add tutorial:
    rows[1][2] = "  ← write your predictions here...";
    rows[2][3] = "... extend the prediction table to see your future ...";
    rows[3][9] = "... and tweak the algorithm to improve your predictions ↓";

    worksheet.addRows(rows);

    // set heading styles:
    [ 'A1', 'B1',
                     'D5',       'F5',       'I5',
                     'D6', 'E6', 'F6', 'G6', 'I6', 'J6',
    ].forEach( cell => worksheet.getCell( cell ).style = heading_style );

    // merge headings:
    [
        "D3:G3",
        "D5:E5", "F5:G5", "I5:J5"
    ].forEach( cells => worksheet.mergeCells(cells) );

    // remove formatting above the start of the prediction table:
    [ 'D', 'E', 'F', 'G' ].forEach( column =>
        [ 1, 2, 3, 4 ].forEach( row =>
            worksheet.getCell( column+row ).fill = {
                fill: {
                    type: "pattern",
                    pattern: "none",
                },
            }
        )
    );

    // set setting formats:
    worksheet.getCell( 'J7' ).style = { numFmt: "0" };
    worksheet.getCell( 'J9' ).style = { numFmt: "0.00" };
    [10,11].forEach( cell => worksheet.getCell( 'J'+cell ).style = sleep_column.style );
    [13,14].forEach( cell => worksheet.getCell( 'J'+cell ).style =  wake_column.style );
    [8,12,15,16].forEach( cell => worksheet.getCell( 'J'+cell ).style = { numFmt: "[HH]:MM" } );

    // format the tutorial:
    worksheet.getCell('D3').alignment = { horizontal: 'center' };
    worksheet.getCell('D3').font = {
        name: 'Calibri',
        color: { argb: "FF000000" }
    };
    worksheet.getCell('J4').alignment = { horizontal: 'right' };

    return workbook;

});
