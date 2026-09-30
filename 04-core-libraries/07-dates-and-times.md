---
title: Dates & Times
summary: The java.time API gives one type per question — LocalDate, LocalTime and LocalDateTime for what a calendar or clock shows, Instant and ZonedDateTime for a moment on Earth, Period and Duration for an amount of time. Month-end arithmetic, counting days, time zones, daylight saving gaps and overlaps, and DateTimeFormatter patterns and their traps. Every example compiled and run.
prereqs: []
---

# Dates & Times — the `java.time` API

A date looks like a simple value, and it is not. Months have 28 to 31 days, and some years have a 29th of February. The time on the clock depends on where you stand. Twice a year, in many places, an hour of the clock is skipped or repeated.

Java's answer is the **`java.time`** package, added in Java 8 <abbr title="JEP 150: Date & Time API">[1]</abbr>. It has one type for each question you can ask about time:

- **What does the calendar or the clock say?** `LocalDate`, `LocalTime` and `LocalDateTime`. These hold no time zone.
- **Which moment on Earth?** `Instant`, and `ZonedDateTime` for a moment seen from one place.
- **How much time?** `Period` for years, months and days; `Duration` for hours, minutes and seconds.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- Pick the type by the question: a calendar date, a moment, or an amount of time.
- Every `java.time` object is **immutable**: `plusDays` returns a *new* object and leaves the old one alone.
- A calendar day is not always 24 hours. `java.time` keeps "one day later" and "24 hours later" apart, and so must you.

</div>

This lesson uses [sorting a `List`](/synapse/programming-languages/java/core-libraries/the-collections-framework), [`equals`](/synapse/programming-languages/java/core-libraries/equals-and-hashcode) and [enums](/synapse/programming-languages/java/core-libraries/enums-and-records). A few examples stop with a thrown exception, because the failure is the point. You learn to catch exceptions in [the next chapter](/synapse/programming-languages/java/robust-oop/exceptions).

**You'll be able to:** predict the date that month arithmetic lands on, including at the end of a month; pick `Period` or `Duration` for an amount of time, and `LocalDateTime` or `ZonedDateTime` for a moment; predict what a daylight saving gap or overlap does to a `ZonedDateTime`; write a `DateTimeFormatter` pattern and name the letter traps in `mm`, `hh` and `YYYY`; explain why a `plusDays` call whose result is not assigned changes nothing.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the library and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure, shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Local dates and times](#1-local-dates-and-times)
2. [Date arithmetic: month ends, comparing, counting](#2-date-arithmetic-month-ends-comparing-counting)
3. [Amounts of time: `Period` and `Duration`](#3-amounts-of-time-period-and-duration)
4. [Moments: `Instant`, `ZoneId` and `ZonedDateTime`](#4-moments-instant-zoneid-and-zoneddatetime)
5. [Daylight saving time: gaps and overlaps](#5-daylight-saving-time-gaps-and-overlaps)
6. [Formatting and parsing](#6-formatting-and-parsing)
7. [Mental-model summary](#7-mental-model-summary)
8. [Gotcha checklist](#8-gotcha-checklist)
9. [Check yourself](#-check-yourself)
10. [Sources](#-sources)

---

## 1. Local dates and times

"Local" means *as read off a calendar or a clock, with no place attached*. A birthday is a local date: 15 March is 15 March wherever you are. Three types cover the local view:

- **`LocalDate`** — a date: year, month, day. No time and no zone <abbr title="Java SE 21 API, java.time.LocalDate">[2]</abbr>.
- **`LocalTime`** — a time of day: hour, minute, second, nanosecond. No date.
- **`LocalDateTime`** — both together. Still no zone.

You make one with a **static factory method** named `of`, in the same style as `List.of`. None of these types has a public constructor.

```java run
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class Main {
    public static void main(String[] args) {
        LocalDate day = LocalDate.of(2024, 3, 15);
        LocalTime time = LocalTime.of(9, 30);
        LocalDateTime meeting = LocalDateTime.of(day, time);

        System.out.println(day);
        System.out.println(time);
        System.out.println(meeting);
        System.out.println(day.getYear() + " " + day.getMonthValue() + " " + day.getDayOfMonth());
        System.out.println(day.getMonth() + " " + day.getDayOfWeek());
    }
}
```

**Output:**
```
2024-03-15
09:30
2024-03-15T09:30
2024 3 15
MARCH FRIDAY
```

**Analysis.** Each type prints in the **ISO-8601** format: year-month-day, then `T`, then the time. Months count from 1, so March is `3`. `getMonth()` and `getDayOfWeek()` return the enum constants `Month.MARCH` and `DayOfWeek.FRIDAY`. They are ordinary [enums](/synapse/programming-languages/java/core-libraries/enums-and-records), so `==` and `switch` work on them.

`LocalDate.now()` reads today's date from the machine's clock, in its default time zone. Its output changes every day, so no other example here uses it:

```java run
import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        System.out.println("Today is " + LocalDate.now());
    }
}
```

**Output** *(illustrative — the date on the machine that runs it):*
```
Today is 2026-09-30
```

**Intuition.**
*Mechanism.* `LocalDate.of` checks its arguments against the calendar before it builds anything. The month must be 1 to 12, and the day must exist in that month of that year <abbr title="Java SE 21 API, java.time.LocalDate.of">[2]</abbr>.

*Concrete bite.* 2023 was not a leap year, so it had no 29 February. This program compiles, then stops at run time:

```java run
import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        System.out.println("before");
        System.out.println(LocalDate.of(2023, 2, 29));
        System.out.println("after");
    }
}
```

**Output** *(prints `before`, then a thrown exception):*
```
before
Exception in thread "main" java.time.DateTimeException: Invalid date 'February 29' as '2023' is not a leap year
```

*Non-example: throwing the result away.* Every `java.time` object is **immutable**: once built, it never changes <abbr title="Java SE 21 API, java.time.LocalDate: &quot;This class is immutable and thread-safe&quot;">[2]</abbr>. So `plusDays` cannot move a date. It returns a *new* date, and the old one stays where it was. This is the trap you met with [`greeting.toUpperCase();`](/synapse/programming-languages/java/first-steps/strings-the-basics) on a String:

```java run
import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        LocalDate due = LocalDate.of(2024, 3, 15);

        due.plusDays(7);                 // wrong: the new date is thrown away
        System.out.println("due " + due);

        due = due.plusDays(7);           // right: keep the new date
        System.out.println("due " + due);
    }
}
```

**Output:**
```
due 2024-03-15
due 2024-03-22
```

The first `plusDays(7)` built `2024-03-22`, and nothing kept it. The compiler gives no warning. Only the second call, whose result is assigned back to `due`, changed what the variable refers to.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use the `Local` types for what a calendar or a clock shows: a birthday, a shop's opening time, the date and time printed on a ticket. Always keep the value that a `plus` or `minus` method returns.

The cost of immutability is that assignment, every time. The benefit is that a date you pass to a method, or store in a list, can never change under you.

</div>

---

## 2. Date arithmetic: month ends, comparing, counting

`plusDays`, `plusWeeks`, `plusMonths` and `plusYears` add to a date; the `minus` methods subtract. Days and weeks are exact. Months and years are not, because months differ in length.

```java run
import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        LocalDate start = LocalDate.of(2024, 1, 31);

        System.out.println(start.plusDays(1));
        System.out.println(start.plusWeeks(2));
        System.out.println(start.plusMonths(1));
        System.out.println(start.plusMonths(2));
        System.out.println(start.plusMonths(1).plusMonths(1));
        System.out.println(LocalDate.of(2024, 2, 29).plusYears(1));
    }
}
```

**Output:**
```
2024-02-01
2024-02-14
2024-02-29
2024-03-31
2024-03-29
2025-02-28
```

**Analysis.** 31 January plus one month would be 31 February, which does not exist. So `plusMonths` picks the **last valid day** of February: the 29th, as 2024 is a leap year. Two months at once give 31 March. One month, then another, gives 29 March, because the first step already lost the 31st.

**Intuition.**
*Mechanism.* `plusMonths` works in three steps. It adds to the month, checks whether the day exists in the new month, and if not, moves the day back to the month's last day <abbr title="Java SE 21 API, java.time.LocalDate.plusMonths">[2]</abbr>. A missing day never makes it throw, and never spills over into the following month. `plusYears` does the same for 29 February.

*Concrete bite: a billing date that drifts.* A customer signs up on 31 January and is billed monthly. Stepping the date forward one month at a time loses the 31st for good. Counting each bill from the sign-up date keeps it:

```java run
import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        LocalDate signUp = LocalDate.of(2024, 1, 31);

        LocalDate bill = signUp;
        for (int i = 0; i < 4; i++) {
            System.out.println("stepped:    " + bill);
            bill = bill.plusMonths(1);
        }
        for (int i = 0; i < 4; i++) {
            System.out.println("from start: " + signUp.plusMonths(i));
        }
    }
}
```

**Output:**
```
stepped:    2024-01-31
stepped:    2024-02-29
stepped:    2024-03-29
stepped:    2024-04-29
from start: 2024-01-31
from start: 2024-02-29
from start: 2024-03-31
from start: 2024-04-30
```

The stepped dates stuck on the 29th after February. The dates counted from the start return to the month's end whenever the month has one.

**Comparing and counting.** Dates compare with `isBefore`, `isAfter` and `equals`. To count whole units between two dates, use a **`ChronoUnit`**: an enum of units such as `DAYS`, `WEEKS` and `MONTHS`, each with a `between` method. `LocalDate` also has a **natural ordering**, earliest first, so a list of dates sorts with no `Comparator`:

```java run
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        LocalDate a = LocalDate.of(2024, 1, 1);
        LocalDate b = LocalDate.of(2024, 3, 15);

        System.out.println(a.isBefore(b) + " " + a.isAfter(b));
        System.out.println(a.equals(LocalDate.of(2024, 1, 1)));
        System.out.println(ChronoUnit.DAYS.between(a, b));
        System.out.println(ChronoUnit.WEEKS.between(a, b));
        System.out.println(ChronoUnit.DAYS.between(b, a));
        System.out.println(a.isLeapYear() + " " + a.lengthOfMonth());

        List<LocalDate> dates = new ArrayList<>(List.of(
                LocalDate.of(2024, 12, 1), LocalDate.of(2023, 5, 9), LocalDate.of(2024, 1, 20)));
        Collections.sort(dates);
        System.out.println(dates);
    }
}
```

**Output:**
```
true false
true
74
10
-74
true 31
[2023-05-09, 2024-01-20, 2024-12-01]
```

`between` counts **complete** units <abbr title="Java SE 21 API, java.time.LocalDate.until">[2]</abbr>, so 74 days is 10 whole weeks, not 10.6. Swap the arguments and the count turns negative. The start date is counted and the end date is not: 1 January to 2 January is 1 day.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** For a repeating date (a bill, a subscription, a monthly report), count each one from a fixed start with `start.plusMonths(n)`. Never step the previous result forward.

The cost is keeping the start date around. The benefit is that a 31st stays a 31st in every month that has one.

</div>

---

## 3. Amounts of time: `Period` and `Duration`

A date says *when*. An **amount of time** says *how long*. `java.time` has two kinds, and they do not mix:

- **`Period`** is date-based: years, months and days, such as "2 months and 14 days" <abbr title="Java SE 21 API, java.time.Period">[3]</abbr>. It prints as `P2M14D`.
- **`Duration`** is time-based: an exact number of seconds and nanoseconds, such as "8 hours 45 minutes" <abbr title="Java SE 21 API, java.time.Duration">[4]</abbr>. It prints as `PT8H45M`.

Both print in ISO-8601 form. `P` starts the amount, and `T` separates the date part from the time part.

```java run
import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;

public class Main {
    public static void main(String[] args) {
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 3, 15);

        Period gap = Period.between(start, end);
        System.out.println(gap);
        System.out.println(gap.getMonths() + " months and " + gap.getDays() + " days");
        System.out.println("getDays():   " + gap.getDays());
        System.out.println("total days:  " + ChronoUnit.DAYS.between(start, end));

        LocalDate born = LocalDate.of(1990, 8, 20);
        System.out.println("age: " + Period.between(born, end).getYears());
        System.out.println(Period.of(1, 2, 3) + " " + Period.ofWeeks(2));
    }
}
```

**Output:**
```
P2M14D
2 months and 14 days
getDays():   14
total days:  74
age: 33
P1Y2M3D P14D
```

**Analysis.** `Period.between` removes whole months first, then counts the days left over <abbr title="Java SE 21 API, java.time.Period.between">[3]</abbr>. So `getDays()` returns `14`, the leftover days, not the `74` days between the dates. For a total, use `ChronoUnit.DAYS.between`. For someone's age in years, `Period.between(born, today).getYears()` is the right tool.

A `Duration` counts clock time:

```java run
import java.time.Duration;
import java.time.LocalTime;

public class Main {
    public static void main(String[] args) {
        Duration shift = Duration.between(LocalTime.of(9, 0), LocalTime.of(17, 45));
        System.out.println(shift);
        System.out.println(shift.toMinutes() + " minutes");
        System.out.println(shift.toHoursPart() + "h " + shift.toMinutesPart() + "m");

        System.out.println(Duration.ofMinutes(90));
        System.out.println(Duration.ofHours(25));
        System.out.println(Duration.ofDays(2));
        System.out.println(Duration.between(LocalTime.of(17, 0), LocalTime.of(9, 0)));
    }
}
```

**Output:**
```
PT8H45M
525 minutes
8h 45m
PT1H30M
PT25H
PT48H
PT-8H
```

**Analysis.** A `Duration` never rolls over into days: 25 hours prints as `PT25H`, and `ofDays(2)` becomes `PT48H`, exactly 48 hours. `toMinutes()` gives the total; `toHoursPart()` and `toMinutesPart()` give the pieces for display. A `LocalTime` has no date, so 17:00 to 9:00 is 8 hours *backwards*, not an overnight shift.

**Intuition.**
*Mechanism.* `Duration.between` measures in seconds, so both ends must have a time of day <abbr title="Java SE 21 API, java.time.Duration.between">[4]</abbr>. A `LocalDate` has no seconds to measure.

*Concrete bite.* Ask for the `Duration` between two dates, and the program compiles, then fails at run time:

```java run
import java.time.Duration;
import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 3, 15);
        System.out.println(Duration.between(start, end));
    }
}
```

**Output** *(a thrown exception):*
```
Exception in thread "main" java.time.temporal.UnsupportedTemporalTypeException: Unsupported unit: Seconds
```

The message names the unit that is missing: a date has no seconds. Adding a `Duration` to a `LocalDate` fails the same way, and adding a `Period` to a `LocalTime` fails with `Unsupported unit: Days`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use `Period` for amounts a calendar measures (a notice period, an age, "3 months free"). Use `Duration` for amounts a stopwatch measures (a timeout, a shift, a video's length). For a total count of one unit, use `ChronoUnit.X.between`, not a `Period` getter.

The cost is choosing before you compute. The benefit is that a mismatch fails loudly with `Unsupported unit`, instead of returning a plausible wrong number.

</div>

---

## 4. Moments: `Instant`, `ZoneId` and `ZonedDateTime`

A `LocalDateTime` of 09:00 on 3 June 2024 is not a moment. It happens once in Tokyo and 13 hours later in New York. To name a single moment you need a place, or a universal clock:

- **`Instant`** — a point on the universal time-line, counted in seconds from the **epoch**, `1970-01-01T00:00:00Z` <abbr title="Java SE 21 API, java.time.Instant">[5]</abbr>. The `Z` means UTC, the world's reference time.
- **`ZoneId`** — a place's time-zone rules, named like `Europe/Paris` or `America/New_York`. The names come from the IANA Time Zone Database <abbr title="Java SE 21 API, java.time.ZoneId">[6]</abbr>.
- **`ZonedDateTime`** — a local date-time, plus the zone that pins it to one instant. It also stores the **offset**: how far that place's clock is from UTC at that moment, such as `-04:00`.

```java run
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class Main {
    public static void main(String[] args) {
        ZoneId newYork = ZoneId.of("America/New_York");
        ZoneId tokyo = ZoneId.of("Asia/Tokyo");

        ZonedDateTime call = ZonedDateTime.of(LocalDateTime.of(2024, 6, 3, 9, 0), newYork);
        System.out.println(call);
        System.out.println(call.withZoneSameInstant(tokyo));
        System.out.println(call.withZoneSameLocal(tokyo));
        System.out.println(call.toInstant());
    }
}
```

**Output:**
```
2024-06-03T09:00-04:00[America/New_York]
2024-06-03T22:00+09:00[Asia/Tokyo]
2024-06-03T09:00+09:00[Asia/Tokyo]
2024-06-03T13:00:00Z
```

**Analysis.** A 09:00 call in New York is at 22:00 in Tokyo: `withZoneSameInstant` keeps the moment and changes the clock reading. `withZoneSameLocal` does the opposite. It keeps 09:00 and moves the moment, which is a different call altogether. `toInstant()` drops the place and gives the moment in UTC, 13:00.

An `Instant` is the form to store and to send between systems. Convert it to a zone only to show it to a person:

```java run
import java.time.Instant;
import java.time.ZoneId;

public class Main {
    public static void main(String[] args) {
        System.out.println(Instant.ofEpochSecond(0));
        System.out.println(Instant.ofEpochSecond(1_700_000_000L));

        Instant launch = Instant.parse("2024-06-03T13:00:00Z");
        System.out.println(launch.getEpochSecond());
        System.out.println(launch.plusSeconds(90));
        System.out.println(launch.atZone(ZoneId.of("Europe/Paris")));
        System.out.println(launch.atZone(ZoneId.of("Asia/Kolkata")));
    }
}
```

**Output:**
```
1970-01-01T00:00:00Z
2023-11-14T22:13:20Z
1717419600
2024-06-03T13:01:30Z
2024-06-03T15:00+02:00[Europe/Paris]
2024-06-03T18:30+05:30[Asia/Kolkata]
```

One instant, three clock readings. Offsets are not always whole hours: India is 5 hours 30 minutes ahead of UTC.

**Intuition.**
*Mechanism.* A `ZonedDateTime` holds three things: the local date-time, the offset and the zone. Its `equals` compares all three <abbr title="Java SE 21 API, java.time.chrono.ChronoZonedDateTime.equals and isEqual">[8]</abbr>. Its `isEqual` compares only the instant.

*Non-example: `equals` to ask "same moment?"* Two objects for the same call, one per city, are the same moment and not `equals`:

```java run
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class Main {
    public static void main(String[] args) {
        ZonedDateTime inNewYork = ZonedDateTime.of(
                LocalDateTime.of(2024, 6, 3, 9, 0), ZoneId.of("America/New_York"));
        ZonedDateTime inTokyo = inNewYork.withZoneSameInstant(ZoneId.of("Asia/Tokyo"));

        System.out.println("equals:  " + inNewYork.equals(inTokyo));
        System.out.println("isEqual: " + inNewYork.isEqual(inTokyo));
    }
}
```

**Output:**
```
equals:  false
isEqual: true
```

That is the [equals contract](/synapse/programming-languages/java/core-libraries/equals-and-hashcode) at work: `equals` answers "same value?", and a New York reading and a Tokyo reading are different values. For "same moment?", use `isEqual`, or compare the two `toInstant()` results.

*Concrete bite: a zone name must be exact.* `ZoneId.of` looks the name up, and a near miss fails at run time <abbr title="Java SE 21 API, java.time.ZoneId.of">[6]</abbr>:

```java run
import java.time.ZoneId;

public class Main {
    public static void main(String[] args) {
        System.out.println(ZoneId.of("America/NewYork"));
    }
}
```

**Output** *(a thrown exception):*
```
Exception in thread "main" java.time.zone.ZoneRulesException: Unknown time-zone ID: America/NewYork
```

The ID has an underscore: `America/New_York`. Avoid three-letter abbreviations such as `PST` too. They are ambiguous, and `ZoneId.of` accepts them only through a separate compatibility map <abbr title="Java SE 21 API, java.time.ZoneId.SHORT_IDS">[6]</abbr>.

**The older classes.** Code written before Java 8 uses `java.util.Date` and `java.util.Calendar`. JEP 150 calls them "poor, mutable" <abbr title="JEP 150: Date & Time API, Motivation">[1]</abbr>:

- a `Date` holds a moment, counted in milliseconds from the epoch, not a date, and its `setTime` changes it in place;
- `Calendar` counts months from 0 <abbr title="Java SE 21 API, java.util.Calendar.MONTH">[11]</abbr>.

When you meet them, convert at the boundary:

```java run
import java.time.Instant;
import java.util.Calendar;
import java.util.Date;

public class Main {
    public static void main(String[] args) {
        System.out.println("Calendar.JANUARY  = " + Calendar.JANUARY);
        System.out.println("Calendar.DECEMBER = " + Calendar.DECEMBER);

        Date legacy = new Date(0);                 // milliseconds since 1970-01-01T00:00:00Z
        legacy.setTime(86_400_000L);               // a Date can be changed in place
        Instant modern = legacy.toInstant();       // old to new
        System.out.println(modern);
        System.out.println(Date.from(modern).getTime());   // new to old
    }
}
```

**Output:**
```
Calendar.JANUARY  = 0
Calendar.DECEMBER = 11
1970-01-02T00:00:00Z
86400000
```

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Store and compare moments as `Instant`. Attach a `ZoneId` only to show a moment to a person, or to do calendar arithmetic in their place. A `LocalDateTime` is a moment only once you say *where*.

The cost is a conversion at each edge of the program. The benefit is that two servers in different countries agree on what happened when.

</div>

---

## 5. Daylight saving time: gaps and overlaps

In many zones the offset changes twice a year. In New York in 2024, clocks jumped from 02:00 to 03:00 on 10 March, and fell back from 02:00 to 01:00 on 3 November. That creates two kinds of local time that do not map to one instant:

- a **gap**: a local time that never happened, such as 02:30 on 10 March;
- an **overlap**: a local time that happened twice, such as 01:30 on 3 November.

`ZonedDateTime` resolves both without throwing <abbr title="Java SE 21 API, java.time.ZonedDateTime, class description">[7]</abbr>:

```java run
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class Main {
    public static void main(String[] args) {
        ZoneId newYork = ZoneId.of("America/New_York");

        // 10 March 2024: at 02:00 the clocks jump to 03:00
        ZonedDateTime gap = ZonedDateTime.of(LocalDateTime.of(2024, 3, 10, 2, 30), newYork);
        System.out.println("gap:     " + gap);

        // 3 November 2024: at 02:00 the clocks go back to 01:00
        ZonedDateTime overlap = ZonedDateTime.of(LocalDateTime.of(2024, 11, 3, 1, 30), newYork);
        System.out.println("overlap: " + overlap);
        System.out.println("later:   " + overlap.withLaterOffsetAtOverlap());
    }
}
```

**Output:**
```
gap:     2024-03-10T03:30-04:00[America/New_York]
overlap: 2024-11-03T01:30-04:00[America/New_York]
later:   2024-11-03T01:30-05:00[America/New_York]
```

**Analysis.** In the gap, 02:30 moved **forward by the length of the gap**, to 03:30. In the overlap, 01:30 took the **earlier** offset, `-04:00` (summer time). `withLaterOffsetAtOverlap()` picks the second 01:30, `-05:00`, one hour later in real time.

**Intuition.**
*Mechanism.* `ZonedDateTime` has two kinds of addition <abbr title="Java SE 21 API, java.time.ZonedDateTime.plusDays and plusHours">[7]</abbr>:

- `plusDays`, `plusMonths` and `plusYears` work on the **local** time-line. They change the calendar, keep the clock reading, then look up the offset again.
- `plusHours`, `plusMinutes` and `plusSeconds` work on the **instant** time-line. They add exact elapsed time.

*Concrete bite.* An alarm set for 09:00 on 9 March. "Tomorrow" and "24 hours later" are different answers, because 10 March is 23 hours long:

```java run
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class Main {
    public static void main(String[] args) {
        ZonedDateTime alarm = ZonedDateTime.of(
                LocalDateTime.of(2024, 3, 9, 9, 0), ZoneId.of("America/New_York"));

        ZonedDateTime nextDay = alarm.plusDays(1);
        ZonedDateTime plus24h = alarm.plusHours(24);
        System.out.println("plusDays(1):   " + nextDay);
        System.out.println("plusHours(24): " + plus24h);
        System.out.println("elapsed:       " + Duration.between(alarm, nextDay));
    }
}
```

**Output:**
```
plusDays(1):   2024-03-10T09:00-04:00[America/New_York]
plusHours(24): 2024-03-10T10:00-04:00[America/New_York]
elapsed:       PT23H
```

The same split holds for the amount types. Adding `Period.ofDays(1)` gives 09:00, like `plusDays`. Adding `Duration.ofDays(1)` gives 10:00, because a `Duration` day is always exactly 24 hours <abbr title="Java SE 21 API, java.time.Period, class description">[3]</abbr>.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** "Same time tomorrow" is `plusDays(1)` or a `Period`. "Exactly 24 hours from now" is `plusHours(24)` or a `Duration`. Say which one you mean, because they differ on two days a year.

The cost is choosing on every addition. The benefit is a reminder that fires at 09:00, and a timeout that lasts 24 hours, on the days the clocks change too.

</div>

---

## 6. Formatting and parsing

`toString()` always gives ISO-8601, and `LocalDate.parse` reads ISO-8601 back. For any other layout, a **`DateTimeFormatter`** turns a date into text (formatting) and text into a date (parsing). You build one from a **pattern**: letters that stand for fields <abbr title="Java SE 21 API, java.time.format.DateTimeFormatter, Patterns for Formatting and Parsing">[9]</abbr>.

| Letter | Field | Example |
|---|---|---|
| `yyyy` or `uuuu` | year | `2024` |
| `MM` / `MMM` / `MMMM` | month: number, short name, full name | `03` / `Mar` / `March` |
| `dd` / `d` | day of month, with or without a leading zero | `05` / `5` |
| `EEEE` | day of week | `Tuesday` |
| `HH` | hour, 0–23 | `14` |
| `hh` / `h` | hour on a 12-hour clock, 1–12 | `02` / `2` |
| `mm` | **minute** | `07` |
| `a` | AM or PM | `PM` |

Case matters: `MM` is the month and `mm` is the minute.

```java run
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        LocalDateTime t = LocalDateTime.of(2024, 3, 5, 14, 7);

        DateTimeFormatter numeric = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        System.out.println(t.format(numeric));

        DateTimeFormatter words = DateTimeFormatter.ofPattern("EEEE, d MMMM yyyy, h:mm a", Locale.US);
        System.out.println(t.format(words));

        DateTimeFormatter dayFirst = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        LocalDate parsed = LocalDate.parse("05/03/2024", dayFirst);
        System.out.println(parsed + " is a " + parsed.getDayOfWeek());
    }
}
```

**Output:**
```
05/03/2024 14:07
Tuesday, 5 March 2024, 2:07 PM
2024-03-05 is a TUESDAY
```

**Analysis.** The same formatter both formats and parses. The second formatter takes a **`Locale`**, `Locale.US`, which fixes the language of `Tuesday`, `March` and `PM`. Without one, a formatter uses the machine's default locale <abbr title="Java SE 21 API, DateTimeFormatter.ofPattern(String)">[9]</abbr>, and month names change from machine to machine. A formatter is immutable, so one instance can be shared.

**Intuition.**
*Mechanism.* The formatter reads each letter as a field, with no check that the combination makes sense. It has no way to know you meant the month when you wrote the minute.

*Concrete bite: three wrong letters, no error.* Every line below compiles and runs, and two of them print a wrong date with no warning:

```java run
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        LocalDateTime t = LocalDateTime.of(2024, 3, 5, 14, 7);
        System.out.println("meant dd/MM/yyyy HH:mm, wrote dd/mm/yyyy hh:MM -> "
                + t.format(DateTimeFormatter.ofPattern("dd/mm/yyyy hh:MM")));

        LocalDate newYearsWeek = LocalDate.of(2024, 12, 30);
        System.out.println("yyyy -> " + newYearsWeek.format(DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.US)));
        System.out.println("YYYY -> " + newYearsWeek.format(DateTimeFormatter.ofPattern("YYYY-MM-dd", Locale.US)));
    }
}
```

**Output:**
```
meant dd/MM/yyyy HH:mm, wrote dd/mm/yyyy hh:MM -> 05/07/2024 02:03
yyyy -> 2024-12-30
YYYY -> 2025-12-30
```

- `mm` printed the minute, `07`, where the month belonged, and `MM` printed the month, `03`, where the minute belonged.
- `hh` printed `02`: 14:07 on a 12-hour clock, with no `a` to say PM.
- `YYYY` is the **week-based year** <abbr title="Java SE 21 API, DateTimeFormatter pattern letter Y">[9]</abbr>. The week holding 30 December 2024 counts as week 1 of 2025, so the date printed a year late. The bug shows only in the few days around New Year, which is why it survives testing.

*Non-example: parsing text that is not ISO.* `LocalDate.parse` with no formatter accepts only ISO-8601:

```java run
import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        System.out.println(LocalDate.parse("2024-03-15"));
        System.out.println(LocalDate.parse("15/03/2024"));
    }
}
```

**Output** *(prints `2024-03-15`, then a thrown exception):*
```
2024-03-15
Exception in thread "main" java.time.format.DateTimeParseException: Text '15/03/2024' could not be parsed at index 0
```

"At index 0" is the position where the text stopped matching: the first character. Pass a formatter with the matching pattern, as in the first example of this section.

**Invalid dates in text.** A formatter's default **resolver style** is `SMART`. For a day-of-month too large for its month, `SMART` moves the day to the month's last valid day <abbr title="Java SE 21 API, java.time.format.ResolverStyle.SMART">[10]</abbr>. `STRICT` rejects it instead:

```java run
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;

public class Main {
    public static void main(String[] args) {
        DateTimeFormatter smart = DateTimeFormatter.ofPattern("dd/MM/uuuu");
        System.out.println("smart:  " + LocalDate.parse("31/02/2024", smart));

        DateTimeFormatter strict = smart.withResolverStyle(ResolverStyle.STRICT);
        System.out.println("strict: " + LocalDate.parse("31/02/2024", strict));
    }
}
```

**Output** *(prints the `smart` line, then a thrown exception):*
```
smart:  2024-02-29
Exception in thread "main" java.time.format.DateTimeParseException: Text '31/02/2024' could not be parsed: Invalid date 'FEBRUARY 31'
```

A user typed 31 February, and `SMART` quietly turned it into 29 February. For input from people, use `STRICT`. Pair it with `uuuu` rather than `yyyy`. Under `STRICT`, `yyyy` is the year *of an era*, and without an era field in the pattern, every parse fails with `Unable to obtain LocalDate`.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Use ISO-8601 (`toString` and `parse`) for anything a program reads. Use a pattern only for text a person reads or types, and then use:

- `MM` for months and `HH` for 24-hour time;
- `uuuu` or `yyyy`, never `YYYY`;
- an explicit `Locale`;
- `STRICT` for input.

The cost is five small decisions per pattern. The benefit is dates that are right on 30 December, and a typo that fails instead of storing a wrong date.

</div>

---

## 7. Mental-model summary

| Principle | Consequence |
|---|---|
| `LocalDate`, `LocalTime` and `LocalDateTime` hold no zone | They describe a calendar or a clock, not a moment |
| `java.time` objects are immutable | `d.plusDays(1);` alone does nothing; assign the result |
| `plusMonths` clamps to the month's last valid day | Jan 31 + 1 month = Feb 29 (2024); stepping month by month drifts |
| `ChronoUnit.X.between` counts complete units; the end date is excluded | 74 days is 10 weeks; swap the arguments for a negative count |
| `Period` = years, months, days; `Duration` = exact seconds | `Period.getDays()` is the leftover days, not the total; `Duration` between dates throws |
| `Instant` is a moment in UTC; `ZonedDateTime` is a moment seen from a zone | Store `Instant`; attach a `ZoneId` to show it to a person |
| `ZonedDateTime.equals` compares the local time, offset and zone | Same moment in two zones: `equals` is false, `isEqual` is true |
| A gap moves forward by the gap's length; an overlap takes the earlier offset | 02:30 on a spring-forward day becomes 03:30 |
| `plusDays` keeps the clock reading; `plusHours` adds elapsed time | Across a DST change, one day ≠ 24 hours |
| Pattern letters are case-sensitive and never cross-checked | `mm` is minutes, `hh` is 12-hour, `YYYY` is the week-based year |
| The default resolver is `SMART` | `31/02/2024` parses as 29 February unless you use `STRICT` |

## 8. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| A date "didn't change" after `plusDays` | the returned date was thrown away | `d = d.plusDays(1);` |
| `DateTimeException: Invalid date 'February 29' as '2023' is not a leap year` | `LocalDate.of` got a day that does not exist | check the input; `plusMonths`/`plusYears` clamp instead |
| A monthly date stuck on the 28th or 29th | each date was stepped from the previous one | compute `start.plusMonths(n)` from a fixed start |
| `Period.getDays()` is far too small | it returns the days left after whole months | `ChronoUnit.DAYS.between(a, b)` for a total |
| `UnsupportedTemporalTypeException: Unsupported unit: Seconds` | a `Duration` used with a `LocalDate` | use `Period` or `ChronoUnit.DAYS` for dates |
| `ZoneRulesException: Unknown time-zone ID` | a misspelled zone name, or an abbreviation such as `PST` | use the IANA name, such as `America/New_York` |
| Two times for the same moment are not `equals` | `ZonedDateTime.equals` compares zones too | `isEqual`, or compare `toInstant()` |
| An event is an hour off twice a year | `plusHours(24)` where "same time tomorrow" was meant, or the reverse | `plusDays`/`Period` for clock time; `plusHours`/`Duration` for elapsed time |
| A time that does not exist on the clock came out one hour later | a daylight saving gap | expected; check the rule of your zone if it matters |
| Minutes appear where the month should be | `mm` in the pattern | `MM` for the month, `mm` for the minute |
| The year is wrong only in the days around New Year | `YYYY`, the week-based year | `yyyy` or `uuuu` |
| `DateTimeParseException: … could not be parsed at index 0` | non-ISO text with no formatter, or the wrong pattern | pass a `DateTimeFormatter` whose pattern matches the text |
| `31/02/2024` parsed without error as 29 February | the default `SMART` resolver | `.withResolverStyle(ResolverStyle.STRICT)` with `uuuu` |
| Month or day names differ between machines | the formatter uses the default locale | pass a `Locale` to `ofPattern` |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "What does LocalDate.of(2023, 1, 31).plusMonths(1) return?", "options": ["2023-03-03", "It throws a DateTimeException", "2023-02-28"], "answer": "2023-02-28"}
```

```quiz
{"prompt": "A reminder must fire at 09:00 local time every day, including on the days the clocks change. What do you add to the ZonedDateTime each time?", "options": ["Duration.ofHours(24)", "Period.ofDays(1)", "Either: a day is 24 hours"], "answer": "Period.ofDays(1)"}
```

```quiz
{"prompt": "In America/New_York, the clocks jumped from 02:00 to 03:00 on 10 March 2024. What does ZonedDateTime.of(LocalDateTime.of(2024, 3, 10, 2, 15), ZoneId.of(\"America/New_York\")) give?", "options": ["2024-03-10T02:15-05:00", "It throws a DateTimeException", "2024-03-10T03:15-04:00"], "answer": "2024-03-10T03:15-04:00"}
```

```quiz
{"prompt": "What does LocalDateTime.of(2024, 3, 5, 14, 7) print with the pattern \"dd/mm/yyyy\"?", "options": ["05/03/2024", "05/07/2024", "05/14/2024"], "answer": "05/07/2024"}
```

<details>
<summary>After <code>LocalDate d = LocalDate.of(2024, 3, 15); d.plusDays(1);</code>, what does <code>System.out.println(d)</code> print, and why?</summary>

It prints `2024-03-15`. A `LocalDate` is immutable <abbr title="Java SE 21 API, java.time.LocalDate">[2]</abbr>:

- `plusDays(1)` built a new date, `2024-03-16`, and returned it;
- nothing stored the result, so it was discarded, and `d` still refers to the original date.

Write `d = d.plusDays(1);` to keep it.

</details>

---

## 📚 Sources

1. JEP 150: Date & Time API (JDK 8; "The existing Java date and time classes are poor, mutable, and have unpredictable performance") — <https://openjdk.org/jeps/150>
2. `java.time.LocalDate`, Java SE 21 API (immutable and thread-safe; `of` throws `DateTimeException`; `plusMonths` adjusts "the day-of-month to the last valid day") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/LocalDate.html>
3. `java.time.Period`, Java SE 21 API (date-based amount; `between` removes complete months, then counts days; a `Period` day keeps the local time across daylight saving) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/Period.html>
4. `java.time.Duration`, Java SE 21 API (time-based amount in seconds and nanoseconds; `between` requires the `SECONDS` unit) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/Duration.html>
5. `java.time.Instant`, Java SE 21 API (a point on the time-line, epoch `1970-01-01T00:00:00Z`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/Instant.html>
6. `java.time.ZoneId`, Java SE 21 API (region IDs from the IANA TZDB; `ZoneRulesException` for an unknown ID; `SHORT_IDS`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/ZoneId.html>
7. `java.time.ZonedDateTime`, Java SE 21 API (gaps shift forward by the gap's length; overlaps keep the previous or earlier offset; `plusDays` on the local time-line, `plusHours` on the instant time-line) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/ZonedDateTime.html>
8. `java.time.chrono.ChronoZonedDateTime`, Java SE 21 API (`isEqual` compares the instant; `equals` compares "the offset date-time and the zone") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/chrono/ChronoZonedDateTime.html>
9. `java.time.format.DateTimeFormatter`, Java SE 21 API (pattern letters; `ofPattern(String)` uses the default locale; `SMART` is the default resolver style) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/format/DateTimeFormatter.html>
10. `java.time.format.ResolverStyle`, Java SE 21 API (`SMART` converts a day-of-month past the month's end to its last valid day; `STRICT` rejects it) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/format/ResolverStyle.html>
11. `java.util.Calendar`, Java SE 21 API ("The first month of the year in the Gregorian and Julian calendars is `JANUARY` which is 0") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Calendar.html>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Take the §5 alarm program. Change the start to 09:00 on **2 November** 2024, the day before the clocks fall back. Before you run it, predict the three lines: `plusDays(1)`, `plusHours(24)`, and the elapsed `Duration`.

If you predicted 09:00, 08:00 and `PT25H`, you have the lesson's hardest idea. **A day on the calendar and 24 hours on a stopwatch are different amounts, and `java.time` makes you say which one you mean.**

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
