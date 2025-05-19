import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#112131',
    paddingBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  image: {
    width: 250,
    height: 150,
  },
  resultado: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
});

const InformePDF = ({ evaluacion, fotos, resultado }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Informe de Evaluación de Cataratas</Text>
        <Text style={styles.text}>Fecha: {new Date().toLocaleDateString()}</Text>
      </View>

      {/* Datos Personales */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Datos del Paciente</Text>
        <Text style={styles.text}>Nombre: {evaluacion.nombres} {evaluacion.apellidos}</Text>
        <Text style={styles.text}>Edad: {evaluacion.edad}</Text>
        <Text style={styles.text}>Género: {evaluacion.genero}</Text>
        <Text style={styles.text}>País: {evaluacion.pais}</Text>
        <Text style={styles.text}>Ciudad: {evaluacion.ciudad}</Text>
      </View>

      {/* Fotos */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Fotografías</Text>
        <View style={styles.imageContainer}>
          {fotos.ojo_izquierdo && (
            <Image src={fotos.ojo_izquierdo} style={styles.image} />
          )}
          {fotos.ojo_derecho && (
            <Image src={fotos.ojo_derecho} style={styles.image} />
          )}
        </View>
      </View>

      {/* Resultados */}
      <View style={styles.resultado}>
        <Text style={styles.subtitle}>Resultado del Análisis</Text>
        <Text style={styles.text}>Severidad: {resultado.severidad}</Text>
        <Text style={styles.text}>Descripción: {resultado.descripcion}</Text>
      </View>

      {/* Antecedentes Médicos */}
      {evaluacion.historial_familiar && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Antecedentes Médicos</Text>
          <Text style={styles.text}>Historial familiar: {evaluacion.historial_familiar}</Text>
          <Text style={styles.text}>Cirugías oculares: {evaluacion.cirugias_oculares}</Text>
          <Text style={styles.text}>Traumatismos: {evaluacion.traumatismos_oculares}</Text>
        </View>
      )}
    </Page>
  </Document>
);

export default InformePDF;