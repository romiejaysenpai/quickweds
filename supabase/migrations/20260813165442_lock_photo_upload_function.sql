begin;

revoke all on function public.complete_photo_upload_intent(uuid) from public, anon, authenticated;
grant execute on function public.complete_photo_upload_intent(uuid) to service_role;

commit;
