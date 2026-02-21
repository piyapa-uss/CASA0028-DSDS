library(dplyr)
library(readr)

x <- read_csv("public/data/country_year_type_summary.csv", show_col_types = FALSE)

out <- x %>%
  group_by(country_id, year) %>%
  mutate(total = sum(events_count), share = events_count / total) %>%
  ungroup()

write_csv(out, "public/data/country_year_type_share.csv")