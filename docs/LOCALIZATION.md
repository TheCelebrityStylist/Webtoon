# Localization architecture

Interface strings use stable keys from `lib/i18n.ts`. English, Dutch, German, Spanish, and Portuguese dictionaries expose the same typed key set. Interface locale is a profile preference and secure cookie. It never mutates project content.

Project writing language and regional variant are separate fields. AI receives the selected variant directly; text is not translated through English. Later language services implement locale metadata, deterministic checks, prompt instructions, supported operations, and export conventions behind one interface.
