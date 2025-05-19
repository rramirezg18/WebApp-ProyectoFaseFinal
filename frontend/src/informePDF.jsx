import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';

const InformePDF = ({ evaluacion, fotos, resultado }) => (
  <Document>
    <Page style={{ padding: 30 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Informe de Cataratas</Text>
      
      {/* Datos Personales */}
      <View style={{ marginBottom: 15 }}>
        <Text>Nombre: {evaluacion.primer_nombre} {evaluacion.primer_apellido}</Text>
        <Text>Edad: {evaluacion.edad}</Text>
        <Text>Género: {evaluacion.genero}</Text>
      </View>

      {/* Resultados */}
      <View style={{ marginBottom: 15 }}>
        <Text style={{ color: resultado.severidad === 'No detectado' ? 'green' : 'red' }}>
          Resultado: {resultado.severidad}
        </Text>
        <Text>{resultado.descripcion}</Text>
      </View>

      {/* Fotografías */}
      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        {Object.entries(fotos).map(([tipo, url]) => (
          <Image key={tipo} src={url} style={{ width: 200, height: 150, marginRight: 10 }} />
        ))}
      </View>
    </Page>
  </Document>
);

export default InformePDF;