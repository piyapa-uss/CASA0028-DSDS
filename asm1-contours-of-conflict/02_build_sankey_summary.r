library(readr)
library(dplyr)

# 1. read raw file
conflict <- read_csv("/Users/piyapasotthiwat/Documents/CASA/CASA0028-DSDS/asm1-contours-of-conflict/public/data/conflict_recent.csv",
                     show_col_types = FALSE)

# 2. build sankey summary
sankey_summary <- conflict %>%
  filter(!is.na(year),
         !is.na(region),
         !is.na(type_of_violence)) %>%
  mutate(
    year = as.integer(year),
    type_of_violence = as.integer(type_of_violence)
  ) %>%
  group_by(year, region, type_of_violence) %>%
  summarise(event_count = n(), .groups = "drop") %>%
  arrange(year, region, type_of_violence)

# 3. write small csv
dir.create("public/data", showWarnings = FALSE)

write_csv(sankey_summary,
          "public/data/sankey_summary.csv")
