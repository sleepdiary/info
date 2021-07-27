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
          worksheet         = workbook.addWorksheet("Estimates"),
          settings = [
              0,
              0,
              [ undefined, "Starting wake time", new Date( awake_at ) ],
              [ undefined, "Day length", day_length / one_day ],
              [ undefined, "Uncertainty", estimate_interval / one_day ],
          ],
          sleep_column = {
              width: 18,
              style: {
                  numFmt: "NN MMM D, HH:MM",
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
                  numFmt: "NN MMM D, HH:MM",
                  font: {
                      name: 'Calibri',
                      color: { argb: "FF000000" }
                  },
                  fill: {
                      type: "pattern",
                      pattern: "solid",
                      fgColor: {argb:"FFFFFFA0"},
                  },
              }
          }
    ;

    worksheet.columns = [
        sleep_column, sleep_column,
        wake_column,  wake_column,
        {},
        { width: 18, style: { numFmt: "NN MMM D, HH:MM" } },
        { width: 18, style: { numFmt: "NN MMM D, HH:MM" } },
    ];

    worksheet.addRows(
        [
            ["Estimated sleep time",undefined,"Estimated wake time"],
            ["Earliest","Latest","Earliest","Latest",undefined,"Setting","Value"]
        ]
    );
    worksheet.addRow([
        { formula: "G3+$G$5-G6", result: new Date( asleep_at - estimate_interval + day_length ) },
        { formula: "G3+$G$5+G6", result: new Date( asleep_at + estimate_interval + day_length ) },
        { formula: "G4+$G$5-G6", result: new Date( awake_at   - estimate_interval + day_length ) },
        { formula: "G4+$G$5+G6", result: new Date( awake_at   + estimate_interval + day_length ) },
        undefined,
        "Starting sleep time",
        new Date( asleep_at ),
    ]).commit();

    worksheet.mergeCells("A1:B1");
    worksheet.mergeCells("C1:D1");
    [ "A1", "C1", "A2", "B2", "C2", "D2", "F2", "G2" ].forEach(
        cell => worksheet.getCell(cell).style = {
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
        }
    );

    for ( let n=2; n!=18; ++n ) {
        worksheet.addRow([
            { formula: "A"+(1+n)+"+$G$5", result: new Date( asleep_at - estimate_interval + day_length*n ) },
            { formula: "B"+(1+n)+"+$G$5", result: new Date( asleep_at + estimate_interval + day_length*n ) },
            { formula: "C"+(1+n)+"+$G$5", result: new Date( awake_at   - estimate_interval + day_length*n ) },
            { formula: "D"+(1+n)+"+$G$5", result: new Date( awake_at   + estimate_interval + day_length*n ) },
        ].concat(settings[n])).commit();
    }

    worksheet.getCell("G3").style = sleep_column.style;
    worksheet.getCell("G4").style =  wake_column.style;
    ["G5","G6"].forEach( cell => worksheet.getCell( cell ).style = { numFmt: "[HH]:MM" } );

    return workbook;

});
