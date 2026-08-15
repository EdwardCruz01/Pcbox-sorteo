REVOKE EXECUTE ON FUNCTION public.aprobar_inscripcion(uuid, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.rechazar_inscripcion(uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.aprobar_inscripcion(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.rechazar_inscripcion(uuid, text) TO service_role;