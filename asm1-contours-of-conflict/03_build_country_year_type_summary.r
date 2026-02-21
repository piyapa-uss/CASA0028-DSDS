# 03_build_country_year_type_summary.R
# Build: country_year_type_summary.csv
# Output: asm1-contours-of-conflict/public/data/country_year_type_summary.csv

suppressPackageStartupMessages({
  library(dplyr)
  library(readr)
  library(stringr)
})

# ---- A) find input file (edit if you know exact path) ----
candidates <- c(
  "data_raw/GEDEvent_v25_1.csv",
  "GEDEvent_v25_1.csv",
  "data_raw/conflict_recent.csv",
  "conflict_recent.csv"
)

in_path <- candidates[file.exists(candidates)][1]
if (is.na(in_path)) {
  stop(
    "No input CSV found. Put your raw events CSV in data_raw/ and rename it (e.g. ged.csv),\n",
    "or edit `candidates` in this script to point to the correct file."
  )
}
message("Using input: ", in_path)

# ---- B) read ----
df <- read_csv(in_path, show_col_types = FALSE)

# ---- C) standardize column names ----
# We need: country, country_id, year, type_of_violence
# Try common variants and normalize
rename_if_present <- function(data, from, to) {
  if (from %in% names(data) && !(to %in% names(data))) {
    data <- dplyr::rename(data, !!to := !!sym(from))
  }
  data
}

df <- df |>
  rename_if_present("iso3c", "iso3") |>
  rename_if_present("iso", "iso3") |>
  rename_if_present("country_name", "country") |>
  rename_if_present("location", "country") |>
  rename_if_present("type", "type_of_violence") |>
  rename_if_present("violence_type", "type_of_violence") |>
  rename_if_present("yr", "year")

needed <- c("country", "country_id", "year", "type_of_violence")
missing <- setdiff(needed, names(df))
if (length(missing) > 0) {
  stop("Missing required columns: ", paste(missing, collapse = ", "),
       "\nHave columns: ", paste(names(df), collapse = ", "))
}

# ---- D) clean + aggregate ----
df2 <- df |>
  mutate(
    country = str_squish(as.character(country)),
    country_id = as.integer(country_id),
    year = as.integer(year),
    type_of_violence = as.integer(type_of_violence)
  ) |>
  filter(
    !is.na(year),
    !is.na(type_of_violence),
    type_of_violence %in% c(1L, 2L, 3L),
    !is.na(country_id)
  )

out <- df2 |>
  group_by(country, country_id, year, type_of_violence) |>
  summarise(events_count = n(), .groups = "drop") |>
  arrange(country_id, year, type_of_violence)

# ---- E) write to public/data ----
out_path <- "public/data/country_year_type_summary.csv"
dir.create(dirname(out_path), showWarnings = FALSE, recursive = TRUE)

write_csv(out, out_path)
message("Wrote: ", out_path)
print(out |> arrange(desc(events_count)) |> head(10))