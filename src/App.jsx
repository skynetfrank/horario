import React, { useState, useCallback, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import { es } from "date-fns/locale";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import Swal from "sweetalert2";
import { FaPrint } from "react-icons/fa";

export default function App() {
  const [eventos, setEventos] = useState([]);
  const [deleted, setDeleted] = useState("");

  const messages = {
    date: "Fecha",
    time: "hora",
    event: "Evento Planificado",
    allDay: "Todo el Dia",
    week: "Semana",
    work_week: "Semana",
    day: "Dia",
    month: "Mes",
    previous: "Anterior",
    next: "Proximo",
    yesterday: "Ayer",
    tomorrow: "Manana",
    today: "Hoy",
    agenda: "Todo",
    noEventsInRange: "No Hay Eventos en esta Fecha.",
    showMore: (total) => `+${total} mas`,
  };
  const locales = {
    es: es,
  };
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  useEffect(() => {
    const myApi = async () => {
      try {
        const respuesta = await fetch(
          "https://us-east-1.aws.data.mongodb-api.com/app/application-0-fjddd/endpoint/allevents"
        );
        const results = await respuesta.json();
        const convert = results.map((item) => {
          console.log("item", item);
          const obj = {
            id: item._id,
            title: item.title,
            start: new Date(item.start),
            end: new Date(item.end),
          };
          return obj;
        });
        setEventos(convert);
      } catch (error) {
        console.log(error);
      }
    };
    myApi();
  }, [deleted]);

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      Swal.fire({
        title: "Apertura de Tienda",
        input: "text",
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
      }).then((resultado) => {
        if (resultado.value) {
          const title = resultado.value;
          const data = {
            title: "Apertura: " + title,
            start,
            end,
          };
          setEventos((prev) => [...prev, { start, end, title }]);
          fetch(
            "https://us-east-1.aws.data.mongodb-api.com/app/application-0-fjddd/endpoint/agregarevento",
            {
              method: "POST",
              body: JSON.stringify(data),
              headers: { "Content-type": "application/json; charset=UTF-8" },
            }
          )
            .then((response) => {
              Swal.fire({
                title: "Cierre de Tienda",
                input: "text",
                showCancelButton: true,
                confirmButtonText: "Guardar",
                cancelButtonText: "Cancelar",
              }).then((resultado) => {
                if (resultado.value) {
                  const title = resultado.value;
                  const data = {
                    title: "Cierre: " + title,
                    start,
                    end,
                  };
                  setEventos((prev) => [...prev, { start, end, title }]);
                  fetch(
                    "https://us-east-1.aws.data.mongodb-api.com/app/application-0-fjddd/endpoint/agregarevento",
                    {
                      method: "POST",
                      body: JSON.stringify(data),
                      headers: {
                        "Content-type": "application/json; charset=UTF-8",
                      },
                    }
                  )
                    .then((response) => window.location.reload())
                    .then((json) => window.location.reload())
                    .catch((err) => console.log(err));
                }
              });
            })
            .then((json) => console.log(json))
            .catch((err) => console.log(err));
        }
      });
    },
    [setEventos]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleSelectEvent = useCallback((event) => {
    //window.alert(event);
    console.log("event", event);
    Swal.fire({
      title: "Eliminar Actividad",
      text: "Esta seguro de Eliminar Esta Actividad?: " + event.title,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          fetch(
            `https://us-east-1.aws.data.mongodb-api.com/app/application-0-fjddd/endpoint/deleteevento?id=${event.id}`
          )
            .then((response) => {
              response.json();
              Swal.fire({
                title: "ACTIVIDAD ELIMINADA! ",
                text: "Eliminar Actividad",
              });
              setDeleted(event.id);
              window.location.reload();
            })
            .catch((err) => console.log(err));
        } catch (error) {
          alert("ocurrio un error");
        }
      }
    });
  }, []);

  return (
    <div className="calendario-container">
      <div>
        {" "}
        <h2>Inversiones Paul 2428, C.A.</h2>
        <p>Horario del Personal Tienda Chacao</p>
        <div className="flx">
          <h2>Apertura:</h2>
          <span>8:30 a.m. hasta 4:30 p.m. </span>
        </div>
        <div className="flx">
          <h2>Cierre:</h2>
          <span className="cierre">1:00 p.m. hasta 9:00 p.m. </span>
        </div>
      </div>

      <div>
        <button className="print-btn">
          <FaPrint className="print-calendar-btn" onClick={handlePrint} />
        </button>
      </div>
      <div style={{ height: "90vh", width: "93vw" }}>
        <Calendar
          localizer={localizer}
          messages={messages}
          culture="es"
          views={["day", "month", "agenda"]}
          events={eventos}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
        />
      </div>
    </div>
  );
}
