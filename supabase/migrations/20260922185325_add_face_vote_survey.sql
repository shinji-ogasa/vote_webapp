alter table public.face_votes
  add column age_range text,
  add column gender text,
  add column comment text;

alter table public.face_votes
  add constraint face_votes_age_range_check
    check (age_range is null or age_range in ('under_20', '20s', '30s', '40s', '50s', '60_plus', 'prefer_not_to_say')),
  add constraint face_votes_gender_check
    check (gender is null or gender in ('woman', 'man', 'non_binary', 'other', 'prefer_not_to_say')),
  add constraint face_votes_survey_fields_together_check
    check ((age_range is null) = (gender is null)),
  add constraint face_votes_comment_length_check
    check (comment is null or char_length(comment) <= 280);
