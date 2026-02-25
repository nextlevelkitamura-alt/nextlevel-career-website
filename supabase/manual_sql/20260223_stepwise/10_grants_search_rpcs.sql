GRANT EXECUTE ON FUNCTION get_public_jobs_list_rpc(text, text, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_jobs_list_rpc(text, text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION search_jobs_by_area_rpc(text, text, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION search_jobs_by_area_rpc(text, text, uuid, integer) TO service_role;
