# =====================================
# Contours of Conflict - Data Cleaning
# =====================================

library(readr)
library(dplyr)

# 1. Read raw data
raw <- read_csv("data_raw/GEDEvent_v25_1.csv")

# 2. Quick check
glimpse(raw)

# 3. Filter relevant years
conflict_recent <- raw %>%
  filter(year >= 2000)

# 4. Export cleaned data
write_csv(conflict_recent, "data/conflict_recent.csv")

# 5. Prepare events data by country and year
library(readr)
library(dplyr)

raw <- read_csv("data_raw/GEDEvent_v25_1.csv", show_col_types = FALSE)

country_year <- raw %>%
  filter(year >= 2000) %>%
  group_by(country, year) %>%
  summarise(
    events = n(),
    deaths_best = sum(best, na.rm = TRUE),
    deaths_civilians = sum(deaths_civilians, na.rm = TRUE),
    .groups = "drop"
  )

write_csv(country_year, "data/country_year_summary.csv")

# 5.1 Checking data
nrow(country_year)
range(country_year$year)
arrange(country_year, desc(events)) %>% head(10)

# 5.2 Checking country_id
raw %>%
  distinct(country, country_id) %>%
  arrange(country) %>%
  head(10)

# 5.3 Insert iso3 to summary file for further join
library(countrycode)

country_year <- country_year %>%
  mutate(iso3 = countrycode(country, "country.name", "iso3c"))

sum(is.na(country_year$iso3))

# 5.4 Check NA country
library(dplyr)
library(countrycode)

na_countries <- country_year %>%
  filter(is.na(iso3)) %>%
  distinct(country) %>%
  arrange(country)

na_countries

# 5.5 Clean NA
country_year <- country_year %>%
  mutate(country_std = if_else(country == "Yemen (North Yemen)", "Yemen", country)) %>%
  mutate(iso3 = countrycode(country_std, "country.name", "iso3c"))

sum(is.na(country_year$iso3))

write_csv(country_year, "data/country_year_summary.csv")

country_year %>% filter(country == "Yemen (North Yemen)") %>% distinct(country, country_std, iso3)

sum(is.na(country_year$iso3))

# 6.0 Export file for Web Maplibre
write_csv(country_year, "data/country_year_summary.csv")

# 6.1 Cleaning 
library(sf)
library(dplyr)

world <- st_read("data/countries.geojson", quiet = TRUE)

names(world)
# to match and see as `ISO3166-1-Alpha-3`

world2 <- world %>%
  rename(
    iso3 = ISO3166.1.Alpha.3,
    name = name
  )

st_write(world2, "data/world_countries_iso3.geojson", delete_dsn = TRUE)

# 6.2 Checking
names(world2)

# 6.3 Export
st_write(world2, "data/world_countries_iso3.geojson", delete_dsn = TRUE)

# 7.0 Change name column from event to event_count
country_year <- country_year %>%
  rename(events_count = events)

# 7.1 Check file
names(country_year)

# 8.0 Create Fatality Rate
library(dplyr)
library(countrycode)

country_year <- raw %>%
  filter(year >= 2000) %>%
  group_by(country, year) %>%
  summarise(
    events_count = n(),
    deaths_best  = sum(best, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  mutate(
    country_std = if_else(country == "Yemen (North Yemen)", "Yemen", country),
    iso3 = countrycode(country_std, "country.name", "iso3c"),
    fatality_rate = deaths_best / events_count
  )

sum(is.na(country_year$iso3))   # should be 0
write_csv(country_year, "data/country_year_summary.csv")

country_year <- country_year %>%
  select(country, iso3, year, events_count, deaths_best, fatality_rate)

# 9. Reduce decimal digit
country_year <- country_year %>%
  mutate(fatality_rate = round(fatality_rate, 3))

# 10.Export
write_csv(country_year, "data/country_year_summary.csv")
