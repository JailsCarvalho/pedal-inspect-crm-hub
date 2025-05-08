
import React from "react";
import { useParams } from "react-router-dom";
import ClientDetail from "@/components/clients/ClientDetail";

const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  return <ClientDetail clientId={id} />;
};

export default ClientDetailPage;
