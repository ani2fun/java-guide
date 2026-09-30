---
title: Localization
summary: A Locale names a language and a region, and every locale-sensitive API reads one — NumberFormat for numbers, currency and percentages, DateTimeFormatter for localized dates, ResourceBundle for translated text, and MessageFormat for sentences with values in them. The lookup chain and its fallback to the default locale, the invisible no-break spaces in French and English output, the apostrophe trap, and why text for programs uses Locale.ROOT. Every example compiled and run.
prereqs: []
---

# Localization — `Locale`, formats and resource bundles

The number twelve hundred and thirty-four and a half is written `1,234.5` in the United States. It is `1.234,5` in Germany and `1 234,5` in France. The date 5 March 2024 is `3/5/24` in the United States and `05/03/2024` in France. A program that prints either one the same way everywhere is wrong somewhere.

**Localization** is making a program's output fit the reader's language and region. Java's tools for it all take one argument, a **`Locale`**:

- `NumberFormat` writes numbers, amounts of money and percentages.
- `DateTimeFormatter` writes dates and times, which you met in [Dates & Times](/synapse/programming-languages/java/core-libraries/dates-and-times).
- `ResourceBundle` looks up translated text by key.
- `MessageFormat` puts values into a translated sentence.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **The core idea.**

- Text for **people** is formatted with *their* locale, passed in explicitly.
- Text for **programs** (files, logs, network messages) uses `Locale.ROOT`, so it reads the same on every machine.
- Any method that takes no locale uses the machine's **default** locale, which you did not choose.

</div>

This lesson uses [nested classes](/synapse/programming-languages/java/robust-oop/nested-and-anonymous-classes-and-lambdas), [abstract methods](/synapse/programming-languages/java/robust-oop/abstract-classes-and-interfaces) and [checked exceptions](/synapse/programming-languages/java/robust-oop/exceptions).

**You'll be able to:** build a `Locale` from a language tag and predict how a number, an amount of money and a date print in it; pick between a reader's locale and `Locale.ROOT` for a piece of output; trace which bundle `ResourceBundle.getBundle` returns, including its fallback to the default locale; write a `MessageFormat` pattern with arguments and name the apostrophe trap; explain why parsing `"1,234"` in a French locale gives `1.234`.

<div style="border-left:4px solid #15448e;background:rgba(21,68,142,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

📘 **How to read the Intuition boxes.** Each one is built in three moves:

1. **The mechanism** — what the library and the JVM *do*.
2. **A concrete bite** — a specific, runnable failure, shown so the trap is visible.
3. **The earned rule** — the decision heuristic, now justified rather than asserted, plus its cost.

</div>

---

## Table of contents

1. [Locales](#1-locales)
2. [Numbers, money and percentages](#2-numbers-money-and-percentages)
3. [Dates and times in a locale](#3-dates-and-times-in-a-locale)
4. [Resource bundles: translated text](#4-resource-bundles-translated-text)
5. [Sentences with values: `MessageFormat`](#5-sentences-with-values-messageformat)
6. [The default locale in ordinary code](#6-the-default-locale-in-ordinary-code)
7. [Mental-model summary](#7-mental-model-summary)
8. [Gotcha checklist](#8-gotcha-checklist)
9. [Check yourself](#-check-yourself)
10. [Sources](#-sources)

---

## 1. Locales

A **`Locale`** names a language, and usually a region <abbr title="Java SE 21 API, java.util.Locale">[1]</abbr>. It holds no rules itself. It is a key that locale-sensitive methods use to pick their rules. Two parts matter most:

- the **language**, a lowercase code such as `fr` (French) or `de` (German);
- the **country**, an uppercase code such as `FR` (France) or `CA` (Canada).

French in France and French in Canada share a language and differ in details, so they are different locales. You write a locale as a **language tag**, the parts joined by a hyphen: `fr-FR`, `fr-CA`, `en-US`.

There are three ways to get one:

- `Locale.of("fr", "FR")` — from the parts (Java 19 and later; the `new Locale(…)` constructors are deprecated) <abbr title="Java SE 21 API, java.util.Locale, Obtaining a Locale">[1]</abbr>;
- `Locale.forLanguageTag("fr-CA")` — from a tag, such as one a web browser sends;
- a constant: `Locale.US`, `Locale.FRANCE`, `Locale.GERMANY`, `Locale.JAPAN`.

```java run
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        Locale france = Locale.of("fr", "FR");
        Locale canadianFrench = Locale.forLanguageTag("fr-CA");

        System.out.println(france + "  " + france.toLanguageTag());
        System.out.println(canadianFrench.getLanguage() + " " + canadianFrench.getCountry());
        System.out.println(france.getDisplayName(Locale.US));
        System.out.println(france.getDisplayName(france));
        System.out.println(Locale.JAPAN.getDisplayName(france));
        System.out.println("[" + Locale.ROOT + "] " + Locale.ROOT.toLanguageTag());
    }
}
```

**Output:**
```
fr_FR  fr-FR
fr CA
French (France)
français (France)
japonais (Japon)
[] und
```

**Analysis.**

- `toString()` joins the parts with an underscore, `fr_FR`, and `toLanguageTag()` gives the hyphen form.
- `getDisplayName` names a locale *in* another locale: France's own name for itself is `français (France)`.
- The last line is **`Locale.ROOT`**, the locale with no language and no country. Its tag is `und`, for "undetermined". It is the neutral locale for output that is not meant for any one audience <abbr title="Java SE 21 API, java.util.Locale.ROOT">[1]</abbr>.

Every JVM also has a **default locale**, set at startup from the operating system <abbr title="Java SE 21 API, java.util.Locale, Default Locale">[1]</abbr>. It differs from machine to machine:

```java run
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        System.out.println("default locale: " + Locale.getDefault());
    }
}
```

**Output** *(illustrative — it depends on the machine that runs it):*
```
default locale: en_US
```

**Intuition.**
*Mechanism.* `forLanguageTag` reads a **BCP 47** language tag, the web standard, which separates parts with hyphens. It skips the first part it cannot read, and every part after it <abbr title="Java SE 21 API, java.util.Locale.forLanguageTag">[1]</abbr>. A bad tag never makes it throw.

*Non-example: an underscore in a tag.* `fr_FR` is how a locale *prints*, not how a tag is written. As a tag, the whole string is one unreadable part:

```java run
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        Locale wrong = Locale.forLanguageTag("fr_FR");     // underscore: not a language tag
        Locale right = Locale.forLanguageTag("fr-FR");

        System.out.println("wrong: [" + wrong + "] " + wrong.toLanguageTag());
        System.out.println("right: [" + right + "] " + right.toLanguageTag());
    }
}
```

**Output:**
```
wrong: [] und
right: [fr_FR] fr-FR
```

The wrong tag gave the empty locale, silently. Every format built from it would use neutral rules, and nothing would say why the French text never appeared.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Build a locale with `Locale.of(language, country)`, a constant, or `forLanguageTag` with a hyphenated tag. After `forLanguageTag`, check that `getLanguage()` is not empty if the tag came from outside the program.

The cost is one check. The benefit is that a malformed tag fails where you can see it, not three calls later as English text for a French reader.

</div>

---

## 2. Numbers, money and percentages

**`NumberFormat`** (in `java.text`) formats numbers by a locale's rules. You never build the rules yourself; you ask for a formatter <abbr title="Java SE 21 API, java.text.NumberFormat">[2]</abbr>:

- `getInstance(locale)` — a plain number;
- `getCurrencyInstance(locale)` — an amount of money, with the currency symbol;
- `getPercentInstance(locale)` — a fraction written as a percentage, so `0.75` prints as 75%.

```java run
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        double amount = 1234567.891;
        for (Locale place : List.of(Locale.US, Locale.GERMANY, Locale.of("de", "CH"), Locale.FRANCE)) {
            System.out.println(place + ": "
                    + NumberFormat.getInstance(place).format(amount) + " | "
                    + NumberFormat.getCurrencyInstance(place).format(1234.5) + " | "
                    + NumberFormat.getPercentInstance(place).format(0.75));
        }
    }
}
```

**Output:**
```
en_US: 1,234,567.891 | $1,234.50 | 75%
de_DE: 1.234.567,891 | 1.234,50 € | 75 %
de_CH: 1’234’567.891 | CHF 1’234.50 | 75%
fr_FR: 1 234 567,891 | 1 234,50 € | 75 %
```

**Analysis.** One number, four spellings:

- Germany swaps the roles of `.` and `,`;
- Swiss German groups with an apostrophe-like `’`;
- France groups with a space and puts `€` after the amount.

The rules come from the **CLDR**, the Unicode Consortium's shared locale data, which the JDK has used by default since Java 9 <abbr title="JEP 252: Use CLDR Locale Data by Default">[9]</abbr>.

**Intuition.**
*Mechanism.* The "spaces" in the French line are not the space character. CLDR uses a **no-break space** there, so a line break cannot split `1 234` in two. France groups digits with U+202F, the *narrow* no-break space.

*Concrete bite: a string that looks equal and is not.* Compare the French output to the same text typed on a keyboard:

```java run
import java.text.NumberFormat;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        String printed = NumberFormat.getCurrencyInstance(Locale.FRANCE).format(1234.5);
        System.out.println(printed);
        System.out.println(printed.equals("1 234,50 €"));

        for (char c : printed.toCharArray()) {
            if (c > 127) {
                System.out.printf("U+%04X ", (int) c);
            }
        }
        System.out.println();
    }
}
```

**Output:**
```
1 234,50 €
false
U+202F U+00A0 U+20AC 
```

The two strings look the same on screen, and `equals` says `false`. The printed one holds U+202F between the digit groups and U+00A0, the ordinary no-break space, before `€`. A test that compares formatted output to a typed string fails for this reason alone.

**Parsing is locale-sensitive too.** `parse` reads text back into a number, by the same locale's rules. It reads from the start of the text and may stop before the end <abbr title="Java SE 21 API, java.text.NumberFormat.parse">[2]</abbr>. If the start is not a number, it throws the checked `ParseException`:

```java run
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Locale;

public class Main {
    public static void main(String[] args) throws ParseException {
        NumberFormat us = NumberFormat.getInstance(Locale.US);
        NumberFormat fr = NumberFormat.getInstance(Locale.FRANCE);

        System.out.println(us.parse("1,234.5"));
        System.out.println(fr.parse("1,234"));
        System.out.println(us.parse("12abc"));
        System.out.println(us.parse("abc"));
    }
}
```

**Output** *(prints the lines above the exception, then a thrown exception):*
```
1234.5
1.234
12
Exception in thread "main" java.text.ParseException: Unparseable number: "abc"
```

In France the comma is the decimal separator, so `"1,234"` is one point two three four, not a thousand. `"12abc"` gave `12` with no complaint, because parsing stopped at `a`. Only text with no number at its start throws.

**Money is two things: an amount and a currency.** A currency formatter takes its currency from the locale's *country*, not from your data. `Currency` (in `java.util`) names a currency by its ISO 4217 code, such as `EUR`, and `Currency.getInstance(locale)` gives the currency of a locale's country <abbr title="Java SE 21 API, java.util.Currency">[3]</abbr>:

```java run
import java.text.NumberFormat;
import java.util.Currency;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        double priceInEuros = 1234.5;

        NumberFormat usStyle = NumberFormat.getCurrencyInstance(Locale.US);
        System.out.println("wrong: " + usStyle.format(priceInEuros));   // the locale picked dollars

        usStyle.setCurrency(Currency.getInstance("EUR"));
        System.out.println("right: " + usStyle.format(priceInEuros));

        Currency yen = Currency.getInstance(Locale.JAPAN);
        System.out.println(yen + " has " + yen.getDefaultFractionDigits() + " decimal places");

        NumberFormat whole = NumberFormat.getIntegerInstance(Locale.US);
        System.out.println(whole.format(2.5) + " " + whole.format(3.5));

        NumberFormat compact = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.SHORT);
        System.out.println(compact.format(1_234_567) + " " + compact.format(2_500));
    }
}
```

**Output:**
```
wrong: $1,234.50
right: €1,234.50
JPY has 0 decimal places
2 4
1M 2K
```

- A price in euros printed as `$1,234.50`: the amount was right and the currency was a lie. `setCurrency` keeps the US layout and the euro sign.
- The yen has no minor unit, so a yen amount has no decimal places.
- The formatters round with **half-even** rounding <abbr title="Java SE 21 API, java.text.NumberFormat, Implementation Requirements">[2]</abbr>. A value exactly halfway goes to the even neighbour: `2.5` to `2`, `3.5` to `4`.
- `getCompactNumberInstance` (Java 12) writes short forms such as `1M` for display.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Format numbers for people with `NumberFormat` and the reader's locale. Store money as an amount *and* a currency code, and set the currency on the formatter. Parse numbers from people with the locale they typed in, and never compare formatted text to a string typed on a keyboard.

The cost is carrying a locale and a currency through the program. The benefit is that no reader sees `1,234` and reads a thousand when you meant one and a quarter.

</div>

---

## 3. Dates and times in a locale

In [Dates & Times](/synapse/programming-languages/java/core-libraries/dates-and-times) you wrote patterns such as `dd/MM/yyyy`. A pattern fixes the order of the fields, and the order is itself local: the United States writes the month first. A **localized formatter** takes the order from the locale too. You pick only a **`FormatStyle`**: `FULL`, `LONG`, `MEDIUM` or `SHORT` <abbr title="Java SE 21 API, java.time.format.DateTimeFormatter.ofLocalizedDate">[4]</abbr>.

```java run
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        LocalDate day = LocalDate.of(2024, 3, 5);
        for (FormatStyle style : FormatStyle.values()) {
            DateTimeFormatter f = DateTimeFormatter.ofLocalizedDate(style);
            System.out.println(style + ": "
                    + day.format(f.withLocale(Locale.US)) + " | "
                    + day.format(f.withLocale(Locale.GERMANY)) + " | "
                    + day.format(f.withLocale(Locale.FRANCE)));
        }
    }
}
```

**Output:**
```
FULL: Tuesday, March 5, 2024 | Dienstag, 5. März 2024 | mardi 5 mars 2024
LONG: March 5, 2024 | 5. März 2024 | 5 mars 2024
MEDIUM: Mar 5, 2024 | 05.03.2024 | 5 mars 2024
SHORT: 3/5/24 | 05.03.24 | 05/03/2024
```

**Analysis.** The same date in `SHORT` style is `3/5/24` in the United States and `05/03/2024` in France. Read with the wrong convention, that is 3 May. The day and month names are translated too: `Dienstag, 5. März` in German, `mardi 5 mars` in French.

**Intuition.**
*Mechanism.* A localized style is a pattern that the locale's data chooses. The `FULL` and `LONG` date-time styles "typically require a time-zone" <abbr title="Java SE 21 API, java.time.format.DateTimeFormatter.ofLocalizedDateTime">[4]</abbr>. A `LocalDateTime` has no zone to print.

*Concrete bite.* `MEDIUM` works with a `LocalDateTime`, and `FULL` stops the program (`LONG` fails the same way):

```java run
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        LocalDateTime meeting = LocalDateTime.of(2024, 3, 5, 15, 30);
        DateTimeFormatter medium = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM).withLocale(Locale.US);
        System.out.println(meeting.format(medium));

        DateTimeFormatter full = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.FULL).withLocale(Locale.US);
        System.out.println(meeting.format(full));
    }
}
```

**Output** *(prints the lines above the exception, then a thrown exception):*
```
Mar 5, 2024, 3:30:00 PM
Exception in thread "main" java.time.DateTimeException: Unable to extract ZoneId from temporal 2024-03-05T15:30
```

Use a `ZonedDateTime` for `FULL` or `LONG` date-times, or stay with `MEDIUM` and `SHORT`.

*Non-example: typing the output back in.* Since JDK 20, US English times put a **narrow no-break space** (U+202F) before `AM` and `PM`. That came with the move to CLDR version 42 <abbr title="JDK-8284840: Update CLDR to Version 42.0 (JDK 20)">[10]</abbr>. A formatter parses its own output, and rejects the same time typed with an ordinary space:

```java run
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        DateTimeFormatter shortTime = DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT).withLocale(Locale.US);

        String printed = LocalTime.of(15, 30).format(shortTime);
        System.out.println(printed);
        System.out.printf("the character before PM is U+%04X%n", (int) printed.charAt(4));

        System.out.println(LocalTime.parse(printed, shortTime));
        System.out.println(LocalTime.parse("3:30 PM", shortTime));     // typed with an ordinary space
    }
}
```

**Output** *(prints the lines above the exception, then a thrown exception):*
```
3:30 PM
the character before PM is U+202F
15:30
Exception in thread "main" java.time.format.DateTimeParseException: Text '3:30 PM' could not be parsed at index 4
```

Index 4 is the space. On JDK 17 the same program prints an ordinary space (U+0020) and parses `"3:30 PM"`. On JDK 21 it fails with no change to the code, because the locale data changed underneath it.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Show dates to people with `ofLocalizedDate`/`ofLocalizedDateTime` and their locale. Never parse localized output: it is for reading, and its exact characters change between JDK versions. Exchange dates between programs in ISO-8601.

The cost is two formats per date, one for people and one for programs. The benefit is that a JDK upgrade cannot break the data your program reads.

</div>

---

## 4. Resource bundles: translated text

Numbers and dates have rules. Words do not: someone has to translate "Hello". A **`ResourceBundle`** holds one language's text as key–value pairs. The program asks for a key, and the bundle for the reader's locale answers <abbr title="Java SE 21 API, java.util.ResourceBundle">[5]</abbr>.

Bundles form a family that shares a **base name**, with the locale in each member's name:

- `Messages` — the **base bundle**, the text of last resort;
- `Messages_fr` — French;
- `Messages_fr_CA` — Canadian French, holding only what differs from `Messages_fr`.

A bundle is usually a `.properties` file, shown below. Each Run button compiles one file, so the runnable examples use a **`ListResourceBundle`** instead. It is a bundle written as a class, which returns its pairs from the abstract method `getContents()` <abbr title="Java SE 21 API, java.util.ListResourceBundle">[6]</abbr>. Here the bundles are nested classes of `Main`, so their names start with `Main$`:

```java run
import java.util.List;
import java.util.ListResourceBundle;
import java.util.Locale;
import java.util.ResourceBundle;

public class Main {
    public static class Messages extends ListResourceBundle {          // the base bundle
        protected Object[][] getContents() {
            return new Object[][] { {"greeting", "Hello"}, {"farewell", "Goodbye"} };
        }
    }

    public static class Messages_fr extends ListResourceBundle {       // French
        protected Object[][] getContents() {
            return new Object[][] { {"greeting", "Bonjour"}, {"farewell", "Au revoir"} };
        }
    }

    public static class Messages_fr_CA extends ListResourceBundle {    // Canadian French
        protected Object[][] getContents() {
            return new Object[][] { {"greeting", "Allo"} };
        }
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.US);
        for (String tag : List.of("fr-CA", "fr-FR", "de-DE")) {
            ResourceBundle words = ResourceBundle.getBundle("Main$Messages", Locale.forLanguageTag(tag));
            System.out.println(tag + ": " + words.getString("greeting") + ", "
                    + words.getString("farewell") + "   (bundle " + words.getLocale() + ")");
        }
    }
}
```

**Output:**
```
fr-CA: Allo, Au revoir   (bundle fr_CA)
fr-FR: Bonjour, Au revoir   (bundle fr)
de-DE: Hello, Goodbye   (bundle )
```

**Analysis.** Each lookup walks from the most specific bundle to the most general:

- `fr-CA` found `Messages_fr_CA`, which has `greeting`. It has no `farewell`, so the lookup went on to its **parent**, `Messages_fr`, and found `Au revoir`.
- `fr-FR` found no `Messages_fr_FR`, so it started at `Messages_fr`.
- `de-DE` found no German bundle at all, and fell back to the base bundle.

**Intuition.**
*Mechanism.* `getBundle` builds a list of candidate names from the requested locale: `Messages_de_DE`, then `Messages_de`. If none exists, it does not go to the base bundle yet. It builds a second list from the **default locale** and searches again. Only then does it take the base bundle <abbr title="Java SE 21 API, ResourceBundle.getBundle, the lookup algorithm">[5]</abbr>.

*Concrete bite: the server's locale leaks into the reply.* A German user asks a server whose default locale is French:

```java run
import java.util.ListResourceBundle;
import java.util.Locale;
import java.util.ResourceBundle;

public class Main {
    public static class Messages extends ListResourceBundle {
        protected Object[][] getContents() {
            return new Object[][] { {"greeting", "Hello"} };
        }
    }

    public static class Messages_fr extends ListResourceBundle {
        protected Object[][] getContents() {
            return new Object[][] { {"greeting", "Bonjour"} };
        }
    }

    public static void main(String[] args) {
        Locale.setDefault(Locale.FRANCE);                     // a server set up in Paris

        ResourceBundle german = ResourceBundle.getBundle("Main$Messages", Locale.GERMANY);
        System.out.println("asked for de_DE, got: " + german.getString("greeting"));

        ResourceBundle.Control noFallback =
                ResourceBundle.Control.getNoFallbackControl(ResourceBundle.Control.FORMAT_DEFAULT);
        ResourceBundle base = ResourceBundle.getBundle("Main$Messages", Locale.GERMANY, noFallback);
        System.out.println("without the fallback: " + base.getString("greeting"));
    }
}
```

**Output:**
```
asked for de_DE, got: Bonjour
without the fallback: Hello
```

The German user got French, because the *server* was French. The same code on a server in New York answers in English. `getNoFallbackControl` turns the default-locale step off, so a missing language always gets the base bundle.

A key that no bundle in the chain holds throws the unchecked `MissingResourceException` <abbr title="Java SE 21 API, ResourceBundle.getString">[5]</abbr>:

```java run
import java.util.ListResourceBundle;
import java.util.Locale;
import java.util.ResourceBundle;

public class Main {
    public static class Messages extends ListResourceBundle {
        protected Object[][] getContents() {
            return new Object[][] { {"greeting", "Hello"} };
        }
    }

    public static void main(String[] args) {
        ResourceBundle words = ResourceBundle.getBundle("Main$Messages", Locale.US);
        System.out.println(words.getString("greeting"));
        System.out.println(words.getString("greting"));
    }
}
```

**Output** *(prints the lines above the exception, then a thrown exception):*
```
Hello
Exception in thread "main" java.util.MissingResourceException: Can't find resource for bundle Main$Messages, key greting
```

A misspelled key compiles, and fails only when that line runs. The base bundle is where every key must exist.

**Bundles as `.properties` files.** In a real project each bundle is a text file of `key=value` lines, found on the classpath by the same names. Since Java 9 <abbr title="JEP 226: UTF-8 Property Resource Bundles (JDK 9)">[13]</abbr>, these files are read as UTF-8, with a fallback to ISO-8859-1 <abbr title="Java SE 21 API, java.util.PropertyResourceBundle">[7]</abbr>. So `ç` can be typed as it is. A terminal session with two files:

```
$ cat Messages.properties
greeting=Hello
farewell=Goodbye
$ cat Messages_fr.properties
greeting=Bonjour, ça va ?
$ cat Main.java
import java.util.Locale;
import java.util.ResourceBundle;

public class Main {
    public static void main(String[] args) {
        ResourceBundle fr = ResourceBundle.getBundle("Messages", Locale.FRANCE);
        System.out.println(fr.getString("greeting"));
        System.out.println(fr.getString("farewell"));
    }
}
$ javac Main.java
$ java -cp . Main
Bonjour, ça va ?
Goodbye
```

`Messages_fr.properties` has no `farewell`, so its parent, `Messages.properties`, supplied it.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Put every key in the base bundle, and only the differences in each language's bundle. Always pass the reader's locale to `getBundle`. On a server, where the default locale belongs to the machine, use a no-fallback `Control`.

The cost is a longer `getBundle` call. The benefit is that what a user reads depends on the user, not on where the program was deployed.

</div>

---

## 5. Sentences with values: `MessageFormat`

A translated sentence often has values inside it, and word order differs between languages. "Ada has 12 new messages" in French puts the number first. Gluing strings with `+` fixes the English order into the code. **`MessageFormat`** (in `java.text`) puts the order into the translated text instead <abbr title="Java SE 21 API, java.text.MessageFormat">[8]</abbr>:

- `{0}`, `{1}`, … are **placeholders**: argument 0, argument 1, in any order in the pattern;
- `{1,number,percent}` formats an argument with a type and a style: `number`, `date`, `time` or `choice`.

```java run
import java.text.MessageFormat;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        MessageFormat en = new MessageFormat("{0} has {1} new messages", Locale.US);
        System.out.println(en.format(new Object[] {"Ada", 1234}));

        MessageFormat de = new MessageFormat("{0} hat {1} neue Nachrichten", Locale.GERMANY);
        System.out.println(de.format(new Object[] {"Ada", 1234}));

        MessageFormat fr = new MessageFormat("{1} nouveaux messages pour {0}", Locale.FRANCE);
        System.out.println(fr.format(new Object[] {"Ada", 12}));

        MessageFormat typed = new MessageFormat(
                "{0,number,percent} done, {1,number,currency} paid, year {2,number,#}", Locale.US);
        System.out.println(typed.format(new Object[] {0.5, 9.99, 2024}));
    }
}
```

**Output:**
```
Ada has 1,234 new messages
Ada hat 1.234 neue Nachrichten
12 nouveaux messages pour Ada
50% done, $9.99 paid, year 2024
```

**Analysis.** The arguments are the same in every language, and each pattern puts them where its grammar wants them. A number with no type is formatted by the pattern's locale, so `1234` became `1,234` in English and `1.234` in German. The style `#` means "digits only", with no grouping.

**Intuition.**
*Mechanism.* In a pattern, the single quote `'` starts and ends a **quoted** section, whose text is copied as is. To print one apostrophe, write two: `''` <abbr title="Java SE 21 API, java.text.MessageFormat, Patterns and Their Interpretation">[8]</abbr>.

*Concrete bite: the apostrophe trap.* English is full of apostrophes, and each one opens a quote:

```java run
import java.text.MessageFormat;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        MessageFormat wrong = new MessageFormat("It's {0}'s turn", Locale.US);
        System.out.println(wrong.format(new Object[] {"Ada"}));

        MessageFormat right = new MessageFormat("It''s {0}''s turn", Locale.US);
        System.out.println(right.format(new Object[] {"Ada"}));

        MessageFormat year = new MessageFormat("Copyright {0}", Locale.US);
        System.out.println(year.format(new Object[] {2024}));
    }
}
```

**Output:**
```
Its {0}s turn
It's Ada's turn
Copyright 2,024
```

- In `It's {0}'s turn`, the first `'` quoted the text up to the second `'`. So `{0}` was copied as text, and both apostrophes vanished.
- A year passed as a number is grouped like any number: `Copyright 2,024`. Use `{0,number,#}`, or pass the year as a String.

**Plurals.** "1 files" is wrong, and the `choice` type picks the text by the number. Each option is `limit#text`, where `#` means "from this value" and `<` means "above this value" <abbr title="Java SE 21 API, java.text.MessageFormat, choice">[8]</abbr>:

```java run
import java.text.MessageFormat;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        MessageFormat files = new MessageFormat(
                "{0,choice,0#no files|1#one file|1<{0,number,integer} files}", Locale.US);
        for (int n : new int[] {0, 1, 2, 1500}) {
            System.out.println(n + " -> " + files.format(new Object[] {n}));
        }
    }
}
```

**Output:**
```
0 -> no files
1 -> one file
2 -> 2 files
1500 -> 1,500 files
```

English has two plural forms. Other languages have more, and each translation carries its own `choice` pattern.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Keep a whole sentence, with numbered placeholders, as one bundle value. Never build it from pieces with `+`. Write every apostrophe as `''`, give years the `#` style, and build the `MessageFormat` with the reader's locale.

The cost is escaping apostrophes by hand. The benefit is that a translator can reorder the sentence without touching the code.

</div>

---

## 6. The default locale in ordinary code

Many everyday methods are locale-sensitive and take no locale: `String.format`, `toUpperCase`, `toLowerCase`, and `MessageFormat.format`. Each one uses the **default** locale <abbr title="Java SE 21 API, String.format and Locale.Category.FORMAT">[11]</abbr>. That is right for text a person reads on this machine. It is wrong for text a program reads, because the output changes with the machine.

```java run
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        Locale.setDefault(Locale.GERMANY);           // the machine this runs on is set to German

        double price = 1234.5;
        System.out.println("csv, default locale: " + String.format("%.2f,EUR", price));
        System.out.println("csv, Locale.ROOT:    " + String.format(Locale.ROOT, "%.2f,EUR", price));

        Locale turkish = Locale.forLanguageTag("tr");
        System.out.println("title".toUpperCase(turkish) + " " + "title".toUpperCase(Locale.ROOT));
        System.out.println("TITLE".toLowerCase(turkish).equals("title"));
    }
}
```

**Output:**
```
csv, default locale: 1234,50,EUR
csv, Locale.ROOT:    1234.50,EUR
TİTLE TITLE
false
```

**Analysis.**

- On a German machine, `%.2f` wrote a decimal comma. The comma-separated line `1234,50,EUR` now has three fields, and the program that reads it gets `1234`, `50` and `EUR`. `Locale.ROOT` wrote `1234.50` on every machine.
- Turkish has a dotted and a dotless `i`. `toUpperCase` in Turkish turns `i` into `İ`, and `toLowerCase` turns `I` into `ı` <abbr title="Java SE 21 API, String.toLowerCase(): the Turkish &quot;TITLE&quot; example">[12]</abbr>. So a key compared after `toLowerCase()` stops matching on a Turkish machine.

<div style="border-left:4px solid #195045;background:rgba(25,80,69,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

💡 **Earned rule.** Decide who reads each piece of output. For a person, pass their locale. For a program — a file format, a log line, a key, a protocol — pass `Locale.ROOT` to `String.format`, `toUpperCase` and `toLowerCase`. Leave the default locale to code whose output nobody else reads.

The cost is an extra argument on everyday calls. The benefit is a program that behaves the same in Ankara, Berlin and New York.

</div>

---

## 7. Mental-model summary

| Principle | Consequence |
|---|---|
| A `Locale` is a key (language, country), not a set of rules | Locale-sensitive methods look their rules up by it |
| Tags use hyphens (`fr-FR`); `toString()` uses underscores (`fr_FR`) | `forLanguageTag("fr_FR")` silently returns the empty locale |
| Every JVM has a default locale from the operating system | A method with no locale argument behaves differently per machine |
| `NumberFormat` and `DateTimeFormatter` follow CLDR data | Output holds no-break spaces (U+00A0, U+202F) that a typed string lacks |
| Parsing reads by the locale's rules and may stop early | `"1,234"` is `1.234` in France; `"12abc"` parses as `12` |
| A currency formatter takes the currency from the locale's country | Set the currency from your data with `setCurrency` |
| `getBundle` searches the requested locale, then the **default** locale, then the base | A missing language can come back in the server's language |
| A missing key throws `MissingResourceException` at run time | Every key belongs in the base bundle |
| In `MessageFormat`, `'` quotes and `''` is one apostrophe | `It's {0}` prints `Its {0}` |
| A number with no style is grouped | `{0}` with `2024` prints `2,024`; use `{0,number,#}` |
| Text for programs uses `Locale.ROOT` | CSV, logs and keys read the same on every machine |

## 8. Gotcha checklist

<div style="border-left:4px solid #da5233;background:rgba(218,82,51,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

| Symptom | Likely cause | Fix |
|---|---|---|
| French or German output never appears; the locale prints as empty | an underscore in `forLanguageTag("fr_FR")` | use `fr-FR`, or `Locale.of("fr", "FR")` |
| A formatted number or amount is not `equals` to the same text typed in | CLDR no-break spaces, U+202F or U+00A0 | compare numbers, not text; or build the expected string with the same formatter |
| `"1,234"` parsed as `1.234` | parsed with a locale whose decimal separator is a comma | parse with the locale the user typed in |
| `"12abc"` parsed as `12` without an error | `parse` stops at the first character it cannot read | use `parse(text, position)` and check that the position reached the end |
| A euro price printed with `$` | the currency came from the locale's country | `setCurrency(Currency.getInstance("EUR"))` |
| `2.5` formatted as `2` | half-even rounding | set a `RoundingMode` if you need half-up |
| `DateTimeException: Unable to extract ZoneId from temporal` | `FULL` or `LONG` date-time style on a `LocalDateTime` | format a `ZonedDateTime`, or use `MEDIUM` |
| `DateTimeParseException … at index 4` on `3:30 PM` (JDK 20+) | the formatter expects U+202F before `PM` | do not parse localized text; exchange ISO-8601 |
| A user got the wrong language | `getBundle` fell back to the default locale | pass the user's locale; use `getNoFallbackControl` on servers |
| `MissingResourceException: Can't find resource for bundle …, key …` | a misspelled key, or a key missing from the base bundle | add it to the base bundle |
| Apostrophes vanish and `{0}` prints literally | `'` in a `MessageFormat` pattern opens a quote | write `''` |
| A year prints as `2,024` | a number placeholder with no style | `{0,number,#}` |
| A CSV or log line has a decimal comma on some machines | `String.format` with the default locale | `String.format(Locale.ROOT, …)` |
| Case-insensitive keys stop matching on one machine | `toLowerCase()` under a Turkish default locale | `toLowerCase(Locale.ROOT)` |

</div>

---

## ✅ Check yourself

One check per objective. Answer before you open anything.

```quiz
{"prompt": "What does NumberFormat.getInstance(Locale.GERMANY).format(1234.5) return?", "options": ["1,234.5", "1234,5", "1.234,5"], "answer": "1.234,5"}
```

```quiz
{"prompt": "A program writes prices into a CSV file that another program reads. Which locale should String.format use?", "options": ["The user's locale", "Locale.ROOT", "The default locale"], "answer": "Locale.ROOT"}
```

```quiz
{"prompt": "Bundles Messages and Messages_fr exist. The default locale is fr_FR. What does ResourceBundle.getBundle(\"Messages\", Locale.GERMANY) return?", "options": ["The base bundle, Messages", "Messages_fr", "It throws MissingResourceException"], "answer": "Messages_fr"}
```

```quiz
{"prompt": "What does new MessageFormat(\"It's {0}\", Locale.US).format(new Object[] {\"late\"}) return?", "options": ["It's late", "Its {0}", "It's {0}"], "answer": "Its {0}"}
```

<details>
<summary>Why does <code>NumberFormat.getInstance(Locale.FRANCE).parse("1,234")</code> return <code>1.234</code>, and how do you get one thousand two hundred and thirty-four?</summary>

In French the comma is the **decimal** separator, so `1,234` reads as one point two three four <abbr title="Java SE 21 API, java.text.NumberFormat">[2]</abbr>. The US grouping comma means nothing to a French parser.

The text itself is ambiguous; only its locale says what it means. Parse it with the locale it was written in: `NumberFormat.getInstance(Locale.US).parse("1,234")` returns `1234`.

</details>

---

## 📚 Sources

1. `java.util.Locale`, Java SE 21 API (`Locale.of` since 19; deprecated constructors; `forLanguageTag` ignores the first ill-formed subtag and all after it; `ROOT`; the default locale) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Locale.html>
2. `java.text.NumberFormat`, Java SE 21 API (`parse` reads "from the beginning of the given string" and "may not use the entire text"; `ParseException`; half-even rounding; `getCompactNumberInstance` since 12) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/text/NumberFormat.html>
3. `java.util.Currency`, Java SE 21 API (ISO 4217 codes; `getDefaultFractionDigits`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Currency.html>
4. `java.time.format.DateTimeFormatter`, Java SE 21 API (`ofLocalizedDate`, `ofLocalizedDateTime`; "The `FULL` and `LONG` styles typically require a time-zone") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/format/DateTimeFormatter.html>
5. `java.util.ResourceBundle`, Java SE 21 API (candidate bundle names; the default-locale fallback from `getFallbackLocale`; the base name as last resort; `MissingResourceException`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ResourceBundle.html>
6. `java.util.ListResourceBundle`, Java SE 21 API (`getContents` returns the key–value pairs) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ListResourceBundle.html>
7. `java.util.PropertyResourceBundle`, Java SE 21 API (input "encoded in UTF-8", re-read in ISO-8859-1 on a malformed sequence) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PropertyResourceBundle.html>
8. `java.text.MessageFormat`, Java SE 21 API (quoting: "a single quote itself must be represented by doubled single quotes"; format types and styles; `choice`) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/text/MessageFormat.html>
9. JEP 252: Use CLDR Locale Data by Default (JDK 9) — <https://openjdk.org/jeps/252>
10. JDK-8284840: Update CLDR to Version 42.0 (fixed in JDK 20; CLDR-14032, "NBSP/NNBSP prefixed to AM/PM in time format") — <https://bugs.openjdk.org/browse/JDK-8284840>
11. `java.lang.String.format` and `java.util.Locale.Category.FORMAT`, Java SE 21 API (`format(String, Object...)` uses the default `FORMAT` locale) — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#format(java.lang.String,java.lang.Object...)>
12. `java.lang.String.toLowerCase()`, Java SE 21 API ("TITLE".toLowerCase() in a Turkish locale returns "tıtle") — <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#toLowerCase()>
13. JEP 226: UTF-8 Property Resource Bundles (JDK 9) — <https://openjdk.org/jeps/226>

---

<div style="border-left:4px solid #6d28d9;background:rgba(109,40,217,0.08);padding:0.6rem 1rem;border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0">

🧪 **Predict, then check.** Take the §4 program with three bundles. Change `Locale.setDefault(Locale.US)` to `Locale.setDefault(Locale.CANADA_FRENCH)`. Before you run it, predict the `de-DE` line: which greeting, which farewell, and which bundle?

If you predicted `Allo, Au revoir (bundle fr_CA)`, you have the lesson's hardest idea. **A missing language falls back to the machine's language before the base bundle, so the reply depends on where the program runs.**

</div>

## Your Turn

Before you move on, check your understanding with the coach — explain the idea, apply it, weigh the trade-offs, then defend your reasoning.

<div class="concept-coach"></div>
