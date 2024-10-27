import moment from 'moment';

export const CalculateWorkHours = (
  startTime: moment.Moment, // Cambiamos el tipo a moment.Moment
  endTime: moment.Moment,
): string => {
  // Calcular la diferencia en milisegundos entre las dos fechas
  const diffInMs = endTime.diff(startTime);

  // Convertir la diferencia en horas y minutos
  const duration = moment.duration(diffInMs);
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();

  // Retornar el resultado en el formato "X hrs Y min"
  return `${hours} hrs ${minutes} min`;
};
