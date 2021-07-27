/**
 * Detect common patterns of behaviour
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

add_export("find_patterns",function( recent, long_term ) {

    const patterns = [];

    if ( recent.summary_days && recent.schedule.wake ) {

        /*
         * Look for unusually long days or late nights
         *
         * We check for long days first, because a user with a long day
         * necessarily also has some late nights, but the opposite isn't true.
         */
        if (
            long_term.summary_days.mean < 23.5*ONE_HOUR ||
            long_term.summary_days.mean > 24.5*ONE_HOUR ) {
            patterns.push({
                icon   : "mdi-theme-light-dark",
                message: "Do you have trouble sticking to a bedtime?",
                id     : "day-length"
            });
        } else if (
            recent.schedule.sleep.mean >  2*ONE_HOUR &&
            recent.schedule.sleep.mean < 10*ONE_HOUR
        ) {
            patterns.push({
                icon: "mdi-weather-night",
                message: "Do you have trouble getting to sleep on time?",
                id: "late-sleep"
            });
        }

        /*
         * Look for wake events that occur during daylight hours
         */
        if (
            recent.schedule.wake.mean > 10*ONE_HOUR &&
            recent.schedule.wake.mean < 20*ONE_HOUR
        ) {
            patterns.push({
                icon   : "mdi-weather-sunny-alert",
                message: "Does sunlight bother you while you're asleep?",
                id     : "sunlight"
            });
        }

    }

    return patterns;

});
