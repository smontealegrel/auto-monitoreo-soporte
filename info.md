Datos de Mediastream

Manual Técnico Operativo: Ecosistema de Streaming y Gestión de Infraestructura
Este documento técnico constituye la guía oficial para la arquitectura, operación y mantenimiento de la infraestructura de streaming integrada bajo la plataforma Mediastream. Está diseñado para personal de ingeniería de broadcast y operaciones técnicas.
1. Fundamentos Técnicos de Streaming y Codificación
1.1. Glosario Técnico
Encoder: Dispositivo que hace posible la codificación y transcodificación de señales (ej. AWS Elemental).
Bitrate: Cantidad de datos que se reproducen por segundo.
Transcoding: Conversión de un formato a otro que posea una calidad similar.
m3u8: Archivo de texto sin formato utilizado para almacenar URLs de las rutas de audio y video.
HLS (HTTP Live Streaming): Protocolo de comunicaciones de transmisiones adaptativas creado por Apple basado en HTTP.
AAC (Advanced Audio Coding): Formato de codificación de audio digital estándar para streaming.
1.2. Tipos de Envío de Streaming
Descarga tradicional: Transferencia clásica de archivos de audio y video mediante protocolos de red estándar.
Descarga progresiva: Permite iniciar la reproducción del contenido mientras el archivo continúa descargándose en segundo plano.
Streaming Live: Transmisión y consumo de contenido audiovisual en tiempo real a través de redes IP.
1.3. Configuración de Calidad y Bitrate
Para señales de alta definición, se establecen los siguientes parámetros de referencia:
Parámetro
Recomendación Técnica
Resolución de Video
1080p
Cuadros por segundo (fps)
30 fps
Bitrate de Video
3000 - 6000 kbps
Bitrate de Audio
128 kbps
1.4. Streaming Adaptativo (ABR)
El ABR optimiza la experiencia del usuario ajustando la calidad del flujo según las condiciones de red y hardware.
Mecanismo de Monitoreo: El sistema evalúa heurísticas como el estado del buffer de video, los ciclos de CPU disponibles y la tasa de cuadros perdidos.
Lógica de Conmutación: Si el buffer es robusto y el CPU está holgado, el sistema solicita fragmentos de mayor calidad. Si el buffer desciende o el CPU se satura, conmuta a un flujo inferior de forma transparente.
Diferenciación Arquitectural: Existen dos enfoques: el estatal (stateful), que requiere comunicación constante con un servidor de streaming que decide el cambio; y el sin estado (stateless), donde el reproductor (player) monitorea las heurísticas y solicita de forma autónoma los fragmentos desde diferentes direcciones en un servidor web estándar.
--------------------------------------------------------------------------------
2. Infraestructura de Hardware: AWS Elemental Live
2.1. Especificaciones del Modelo L911AE
Dimensiones: 43.40 cm x 4.28 cm x 89.90 cm (Factor de forma 1RU).
Peso: 17.97 kg (Unidad base).
Consumo Eléctrico: 306 Watts (Potencial máximo).
Disipación de Calor: 1044.1 BTU/hr (Máximo).
Ruido Acústico: 50 dBA (Nivel máximo).
Condiciones Ambientales: Operación de 10 a 35° C (8% a 80% RH); Almacenamiento de -40 a 65° C (5% a 95% RH).
2.2. Configuración de Puertos e Interfaces
Interfaces de Red: 2x 1GbE RJ45 y 4x 1/10/25GbE SFP28.
Interfaces de Video: 8x puertos SD/HD/3G-SDI y 1x LTC (Timecode).
Restricción de Flujo: El modelo estándar L911AE no soporta entradas o salidas de IP sin comprimir.
2.3. Análisis Comparativo: L911AE vs. L911AE-U (Uncompressed)
La variante "-U" está diseñada específicamente para flujos de trabajo de producción IP sin comprimir bajo estándares modernos.
Característica
Modelo L911AE
Modelo L911AE-U
Potencia Máxima
306 W
330 W
Disipación de Calor
1044.1 BTU/hr
1126 BTU/hr
Puertos QSFP28
No incluye
2 puertos (hasta 100GbE)
Video IP Sin Comprimir
No soportado
Soportado (SMPTE ST 2110 / NMOS)
Peso (Unidad)
17.97 kg
18.15 kg
2.4. Gestión del Sistema
Administración Out-of-Band: iDRAC9 Enterprise.
Almacenamiento Local: 480GB en configuración de almacenamiento redundante.
--------------------------------------------------------------------------------
3. Ecosistema Mediastream Platform
3.1. Visión General de la Plataforma
Mediastream Platform actúa como el orquestador central para la distribución segura y escalable de contenido. Facilita la expansión del alcance de eventos en vivo y VOD mediante herramientas de gestión profesional.
3.2. Integración de Encoders
En el flujo operativo, los equipos AWS Elemental funcionan como nodos de ingestión y procesamiento. Capturan señales base (SDI) o SRT y ejecutan la codificación/transcodificación necesaria para alimentar los puntos de publicación de la plataforma.
--------------------------------------------------------------------------------
4. Directorio Operativo de Accesos por Cliente
4.1. CARACOL
El acceso se realiza vía VPN Check Point. La elección del Gateway depende de la ruta de red: 190.217.109.98 (Cirion) o 138.121.15.146 (Liberty).
Equipo
Versión de Software
Acceso Web (IP)
Credenciales Web
Credenciales SSH
Elemental 1
v2.25.7.750670
172.19.4.20
Elemental / -Caracol2025-
elemental / 1234567Aa.
Elemental 2
v2.25.9.764454
172.19.4.21
Elemental / -Caracol2025-
elemental / 1234567Aa.
Elemental 3
v2.23.4.164932
172.19.4.22
Elemental / -Caracol2025-
elemental / 5LR0VH3
Elemental 4
v2.26.4.763844
172.19.4.23
Elemental / -Caracol2025-
elemental / 1234567Aa.
Elemental 5
N/A
172.19.4.24
elemental / 1234567Aa.
elemental / 1234567Aa.
Server
N/A
172.17.34.47
soporte@mediastre.am / Soporte*Elemental123#
mediastream / eM<!6<35=!zf
4.2. MEGA
Acceso VPN Forticlient: vpn.megamedia.cl. Usuario: jmolina_mdstrm / Clave: Soporte2025* (Requiere Token).
Equipo
Acceso Web (URL/IP)
Credenciales Web
Credenciales SSH
Elemental 0
elive.mega.cl
soporte@mediastre.am / Soporte2025*
soporte@mediastre.am / Soporte2025*
Elemental 1
172.16.110.21
soporte@mediastre.am / Soporte2025*
soporte@mediastre.am / Soporte2025*
Elemental 2
172.16.110.20
soporte@mediastre.am / Soporte2025*
soporte@mediastre.am / Soporte2025*
Elemental 3
172.17.200.43
soporte@mediastre.am / Soporte2025*
mega / aSDk9E
Elemental 4
172.16.110.24
soporte@mediastre.am / Soporte2025*
soporte@mediastre.am / Soporte2025*
Elemental 5
172.16.110.25
admin / 8Sjgtssj29. O soporte@mediastre.am / Nd2f8EHUtMJ@
elemental / 7hth6SFsd.
Server 2
eserver2.mega.cl
soporte@mediastre.am / Nd2f8EHUtMJ@
mega / aSDk9E
Server 3
172.16.110.19
soporte@mediastre.am / Soporte2023*
elemental / aSDk9E
Equipos Chameleon (MEGA):
Módulo A (01/02): 172.16.110.72 / 172.16.110.27
Módulo B (01/02): 172.16.110.73 / 172.16.110.28
Credenciales: soporte_mdstrm / QkHGuWr5h4LK3pVtvsCbP6
4.3. TVN y LATINA
TVN: VPN Server. Usuario jurrego_mdstrm / Clave @+5oJHya.
LATINA: Acceso vía VPN Wireguard.
Equipo
Acceso Web (URL)
Credenciales Web
Credenciales SSH
Latina Principal
190.216.164.249
admin / cT9t?>fUDU,U=Uc
elemental / JTwcV!Ke;D}>}3eg
Latina Backup
8.243.103.2
admin / e<^vuB[%xGM-ZK$~
elemental / N95*b#}]grAm~K.N
Protocolo de Salto SSH (Latina): En caso de falla de conectividad externa, acceder al equipo disponible y saltar internamente:
Desde Backup hacia Principal: ssh elemental@10.0.0.10
Desde Principal hacia Backup: ssh elemental@10.0.0.20
4.4. WIN SPORTS
Acceso VPN Wireguard. Usuario: soporte@mediastre.am / Clave: Mucur41219*-+2024.
Equipo
Salida/Proveedor
Interfaz
URL / IP
Credenciales SSH
Main
Columbus
eth1
190.242.110.114
mediastream / Mucur41219*-+2024
Main
Internexa
eth0
190.90.147.74
mediastream / Mucur41219*-+2024
Backup
Columbus
eth4
190.242.110.115
mediastream / Mucur41219*-+2024
Backup
Internexa
eth0
190.90.147.75
mediastream / Mucur41219*-+2024
4.5. Otros Clientes
Cliente
Método de Acceso
Identificador / IP
Credenciales
América TV
VPN / Anydesk
190.187.186.181 / ID: 1 484 837 862
tvgo / americatvgo
Canal 1
Wireguard
190.60.214.211
elemental / m3d1astr3am
TVNMedia PA
Global Protect
179.63.196.210
mediastream / !2r4QT7rtqy#Au
HCH
Anydesk
1488804053
Multiplicado$
Grupo Flaix
Anydesk
1158586981 / 1614423258
mediastream2025*
Canal Capital
Forticlient
192.168.0.251
media.streaming / El3m3nt@l
4.6. Soporte y Recuperación
Propósito
Equipo / Método
IP / ID
Credenciales
Elemental Soporte
Web / SSH
192.168.1.172
admin O elemental / 1234567Aa.
PC Soporte Ofic.
Anydesk
1768516914
Soporte2025$
América TV Recup.
SSH
192.168.1.236
elemental / 8((m"A]>&VT[
América TV Recup.
Web (Admin)
192.168.1.236
}acw[e5S7vjUWcMz O 7!pkq2]c})gUSaYc
--------------------------------------------------------------------------------
5. Protocolos de Entrega y Formatos Avanzados
5.1. Common Media Application Format (CMAF)
CMAF es un estándar que unifica la entrega de medios HTTP mediante el uso de contenedores uniformes basados en Fragmented MP4 (.fmp4).
Eficiencia de Costos: Al permitir que un mismo archivo (.fmp4) sirva simultáneamente a protocolos HLS y DASH, se elimina la necesidad de almacenar duplicados en formatos .ts y .mp4. Esto reduce los costos de almacenamiento y caché en un 50%.
Chunked Encoding: Analogía del "servicio por tiempos"; el usuario consume el primer fragmento (entrada) mientras el encoder procesa el siguiente (plato principal), reduciendo drásticamente la latencia.
5.2. Comparativa de Protocolos
Protocolo
Latencia
Compatibilidad
Función Principal
HLS
Alta (5-20s)
Playback Universal
Estándar de Apple, alta fiabilidad.
RTMP
Baja (~5s)
Ingest
Legado; ingestión de señales hacia encoders.
WebRTC
Ultra-Baja (<1s)
Browsers (P2P)
Interactividad y sub-segundo.
5.3. Gestión de CDN y Caching
La Content Delivery Network (CDN) es una red de servidores distribuidos que acelera la entrega de video mediante el almacenamiento en caché de fragmentos cerca del espectador. Esto reduce la carga en el servidor de origen y minimiza el tiempo de respuesta (RTT).
--------------------------------------------------------------------------------
6. Seguridad y Calidad de Experiencia
6.1. Protección de Contenido (DRM)
Sistemas soportados para la protección de derechos digitales:
Tecnologías: Apple FairPlay, Google Widevine y Microsoft PlayReady.
CENC (Common Encryption): Estándar que permite cifrar el contenido una sola vez para ser descifrado por cualquiera de los sistemas DRM mencionados.
6.2. Métricas de Rendimiento (QoS vs. QoE)
Quality of Service (QoS): Mide la integridad técnica de la infraestructura (bitrate entregado, estado del servidor, latencia de red).
Quality of Experience (QoE): Mide la percepción real del usuario (tiempo de inicio del video, buffering, calidad visual subjetiva).

--------------------------------------------------------------------------------
tags:
módulo
live
streaming
api created: 2026-04-20 status: current
--------------------------------------------------------------------------------
Módulo Live Streams
[!abstract] Descripción General El módulo Live Streams es el núcleo de transmisión en vivo de la plataforma Mediastream. Gestiona la creación, configuración, reproducción, grabación y monetización de streams en vivo. Soporta múltiples protocolos, protección DRM, restricciones de acceso granulares, inserción de publicidad, retransmisión social y grabación automatizada.
--------------------------------------------------------------------------------
Tabla de Contenidos
[[#Arquitectura]]
[[#Tipos de Stream]]
[[#Configuración de un Stream]]
[[#Endpoints de API — Gestión]]
[[#Endpoints de API — Grabación]]
[[#Endpoints de API — Programación y EPG]]
[[#Endpoints de API — Publicidad]]
[[#Endpoints de API — Retransmisión (Restream)]]
[[#Endpoints de API — Metadatos e Interactividad]]
[[#Endpoints de API — Recursos Visuales]]
[[#Endpoints de API — Seguridad y DRM]]
[[#Endpoints de Embed y Reproducción]]
[[#Modelo de Datos — Event (Stream)]]
[[#Modelo de Datos — Grabaciones]]
[[#Modelo de Datos — Schedules]]
[[#Modelo de Datos — Restreaming]]
[[#Modelo de Datos — Playout]]
[[#Modelo de Datos — Metadatos]]
[[#Modelo de Datos — Ad Breaks]]
[[#Control de Acceso]]
[[#Perfiles de Encoding]]
[[#DVR y Timeshift]]
[[#MediaLive (AWS)]]
[[#MediaPackage (AWS)]]
[[#Estados y Ciclo de Vida]]
[[#Módulos Conectados]]
[[#Comportamientos Especiales y Restricciones]]
[[#Diagnóstico de Problemas Comunes]]
--------------------------------------------------------------------------------
Arquitectura
El módulo Live se organiza en tres capas principales:
Capa
Responsabilidad
API Routes
Endpoints REST para administración y gestión del stream
Embed Routes
Reproducción pública, manifiestos HLS/DASH/HDS/SMIL
Data Layer
Colecciones MongoDB: events, event_recordings, event_schedules, etc.
Services
Integración AWS (MediaLive, MediaPackage, CloudFront), scheduling, transcoding
El stream en vivo se identifica como un documento en la colección events. Cada stream tiene:
Un stream_id (clave de broadcast hacia el CDN)
Un publishing_token (token de ingest seguro para el encoder)
Un application_id (identificador de aplicación en el CDN)
--------------------------------------------------------------------------------
Tipos de Stream
Tipo
Descripción
video
Stream audiovisual estándar
audio
Stream solo de audio (requiere flag live_audio en la cuenta)
--------------------------------------------------------------------------------
Configuración de un Stream
Parámetros Obligatorios al Crear
Campo
Tipo
Descripción
name
String
Nombre visible del stream
type
String
video o audio
cdn_zones
String[]
Al menos una zona CDN (ej: us, cl)
encodingProfiles
Array
Perfiles de encoding o preset
Parámetros Opcionales Frecuentes
Campo
Tipo
Default
Descripción
online
Boolean
false
Estado de broadcast al crear
dvr
Boolean
false
Habilita timeshift/DVR
closed_access
Boolean
false
Requiere autenticación para ver
preferred_protocol
String
hls
Protocolo preferido: hls, rtmp, rtmpt, hds
player_skin
String
default
Skin del player
ad
ObjectId
—
Configuración de publicidad
ad_insertion
ObjectId
—
SSAI (server-side ad insertion)
ad_insertion_interval
Number
5
Minutos entre ad breaks
epg
ObjectId
—
Origen de EPG
peering
Object
—
{ enabled: true } para CDN peering
external_cdn
Object
—
CDN externo con edge URL personalizado
--------------------------------------------------------------------------------
Endpoints de API — Gestión
Base: /api/live-stream
[!info] Autenticación Todos los endpoints de gestión requieren token de administrador en el header.
Método
Ruta
Descripción
GET
/api/live-stream
Lista todos los streams con filtros: paginación (skip, limit), búsqueda (query), tipo, estado online, bookmark, monitor, mobile
GET
/api/live-stream/:id
Detalle completo del stream incluyendo entry points de ingest
POST
/api/live-stream
Crea nuevo stream
PUT
/api/live-stream/:id
Actualiza configuración del stream
DELETE
/api/live-stream/:id
Elimina el stream
POST
/api/live-stream/:id/toggle-online
Cambia estado online/offline del broadcast
POST
/api/live-stream/:id/toggle-bookmark
Marca/desmarca como destacado
POST
/api/live-stream/:id/toggle-recording
Activa/desactiva flag de grabación
Parámetros de Listado (GET /api/live-stream)
Parámetro
Tipo
Descripción
skip
Number
Offset para paginación
limit
Number
Máximo de resultados
query
String
Búsqueda por nombre (regex)
type
String
Filtro por tipo (video/audio)
online
Boolean
Filtro por estado online
bookmark
Boolean
Solo streams marcados como destacados
monitor
String
Filtro por estado de monitoreo
mobile
Boolean
Filtro por streams con URL mobile habilitada
--------------------------------------------------------------------------------
Endpoints de API — Grabación
Método
Ruta
Descripción
POST
/api/live-stream/:id/start-record
Inicia grabación con perfiles de encoding específicos
POST
/api/live-stream/:id/stop-record
Detiene grabación activa
GET
/api/live-stream/:id/recording
Lista todas las grabaciones del stream
POST
/api/live-stream/:id/recording
Crea entrada de grabación manualmente
PUT
/api/live-stream/:id/recording/:recording_id
Actualiza metadatos de grabación
DELETE
/api/live-stream/:id/recording/:recording_id
Elimina grabación
[!warning] Restricciones para Iniciar Grabación La grabación solo puede iniciarse si:
El stream está online (online === true)
La zona CDN de la cuenta coincide con las zonas CDN del evento
Al menos un perfil de encoding está habilitado
Cada perfil habilitado genera un stream de grabación independiente.
--------------------------------------------------------------------------------
Endpoints de API — Programación y EPG
Método
Ruta
Descripción
GET
/api/live-stream/:id/schedule
Lista schedules con filtro por fecha y atributos custom
GET
/api/live-stream/:id/schedule/:schedule_id
Detalle de un schedule específico
POST
/api/live-stream/:id/schedule-job
Crea job de broadcast programado
PUT
/api/live-stream/:id/schedule-job/:job_id
Actualiza job de schedule
DELETE
/api/live-stream/:id/schedule-job/:job_id
Elimina job de schedule
POST
/api/live-stream/:id/epg/sync
Sincroniza datos EPG desde el origen configurado
POST
/api/live-stream/:id/epg/sync-job
Sincroniza EPG para un evento específico
GET
/api/live-stream/:id/epg
Obtiene configuración de EPG del stream
--------------------------------------------------------------------------------
Endpoints de API — Publicidad
Método
Ruta
Descripción
POST
/api/live-stream/:id/ad-insertion
Inserta ad break vía SCTE-35 (solo MediaLive)
GET
/api/live-stream/:id/ad-break
Lista ad breaks programados
POST
/api/live-stream/:id/ad-break
Crea ad break programado
DELETE
/api/live-stream/:id/ad-break/:ad_break_id
Elimina ad break
--------------------------------------------------------------------------------
Endpoints de API — Retransmisión (Restream)
Método
Ruta
Descripción
GET
/api/live-stream/:id/restream
Lista destinos de retransmisión (custom + redes sociales)
POST
/api/live-stream/:id/restream
Crea destino de retransmisión
GET
/api/live-stream/:id/restream/:restream_id
Detalle de destino
PUT
/api/live-stream/:id/restream/:restream_id
Actualiza destino
DELETE
/api/live-stream/:id/restream/:restream_id
Elimina destino
POST
/api/live-stream/:id/restream/:restream_id/start
Inicia retransmisión
POST
/api/live-stream/:id/restream/:restream_id/stop
Detiene retransmisión
--------------------------------------------------------------------------------
Endpoints de API — Metadatos e Interactividad
Método
Ruta
Descripción
POST
/api/live-stream/:id/metadata
Envía metadatos ID3 / now-playing (solo MediaLive)
GET
/api/live-stream/:id/metadata
Lista registros de metadatos enviados
GET
/api/live-stream/:id/quizzes
Lista quizzes del stream
POST
/api/live-stream/:id/quizzes
Crea quiz
PUT
/api/live-stream/:id/quizzes/:quiz_id
Actualiza quiz
DELETE
/api/live-stream/:id/quizzes/:quiz_id
Elimina quiz
POST
/api/live-stream/:id/quizzes/:quiz_id/send
Envía quiz a los espectadores activos
POST
/api/live-stream/:id/transcription
Crea job de transcripción de audio (requiere módulo AI)
GET
/api/live-stream/:id/transcription/:transcription_id
Estado y resultado de transcripción
[!note] Límite de Quizzes El listado retorna máximo 100 quizzes por consulta. Los quizzes se envían a los espectadores vía eventos de socket.
--------------------------------------------------------------------------------
Endpoints de API — Recursos Visuales
Método
Ruta
Descripción
GET
/api/live-stream/:id/thumb
Lista thumbnails del stream
POST
/api/live-stream/:id/thumb
Sube thumbnail
PUT
/api/live-stream/:id/thumb/:thumb_id
Actualiza thumbnail
DELETE
/api/live-stream/:id/thumb/:thumb_id
Elimina thumbnail
POST
/api/live-stream/:id/background
Sube imagen de fondo
POST
/api/live-stream/:id/logo
Sube/configura logo en stream
--------------------------------------------------------------------------------
Endpoints de API — Seguridad y DRM
Método
Ruta
Descripción
POST
/api/live-stream/:id/drm/token
Genera token JWT para DRM (FairPlay / Widevine / PlayReady)
GET
/api/live-stream/:id/audio_exclusion
Lista reglas de exclusión de audio
POST
/api/live-stream/:id/audio_exclusion
Crea regla de exclusión de audio
PUT
/api/live-stream/:id/audio_exclusion/:rule_id
Actualiza regla
DELETE
/api/live-stream/:id/audio_exclusion/:rule_id
Elimina regla
[!info] Generación de Token DRM El token es JWT y cubre FairPlay, Widevine y PlayReady. Requiere que el stream tenga configurado mediapackage.uuid o external_cdn.uuid.
--------------------------------------------------------------------------------
Endpoints de Embed y Reproducción
Estos endpoints son públicos (con control de acceso) y los consume el player embed.
Método
Ruta
Descripción
GET
/live-stream/:id
Player embed HTML del stream
GET
/live-stream-playlist/:id.m3u8
Manifiesto HLS
GET
/live-stream-playlist/:id.mpd
Manifiesto DASH
GET
/live-stream-playlist/:id.f4m
Manifiesto HDS
GET
/live-stream-playlist/:id.smil
Playlist SMIL
GET
/live-stream-playlist-v/:id.m3u8
HLS con variantes (ABR)
GET
/live-stream-playlist/:id/dvr
Playlist con DVR/timeshift habilitado
GET
/api/live-stream/:id/access
Verifica permisos de acceso del usuario
GET
/api/live-stream/:id/schedule
Próximos schedules (vista embed)
GET
/api/live-stream/:id/records
Clips de grabación disponibles
GET
/api/live-stream/:id/moment
⛔ DEPRECADO — Retorna 410 Gone
GET
/api/live-stream/:id/quiz-detail
Detalle de quiz para espectadores
POST
/api/live-stream/:id/reactions
Registra reacción del espectador
[!info] Caché de Manifiestos
TTL de caché live: 30–60 segundos (configurable)
Usuarios ADMIN bypasean el caché
La clave de caché incluye versión de política de acceso
--------------------------------------------------------------------------------
Modelo de Datos — Event (Stream)
Colección MongoDB: events
Identidad y Estado
Campo
Tipo
Descripción
_id
ObjectId
Identificador único
name
String
Nombre del stream
slug
String
Identificador amigable para URL
account
ObjectId
Cuenta propietaria
type
String
video / audio
online
Boolean
Estado de broadcast activo
recording
Boolean
Grabando en este momento
recording_start_date
Date
Inicio de grabación actual
bookmark
Boolean
Stream destacado
views
Number
Total de reproducciones
date_created
Date
Fecha de creación
Stream y CDN
Campo
Tipo
Descripción
stream_id
String
Clave de broadcast hacia CDN
publishing_token
String
Token seguro de ingest
application_id
String
Identificador de aplicación CDN
preferred_protocol
String
Protocolo preferido: hls, rtmp, rtmpt, hds
cdn_zones
String[]
Zonas de distribución (ej: us, cl)
[!info] Generación de stream_id Se genera automáticamente como SHA256({event_id}{account_id}{timestamp}). Si se define un stream_id personalizado, este sobreescribe el automático.
DVR y Retención
Campo
Tipo
Descripción
dvr
Boolean
DVR/timeshift habilitado
cdn.dvr_time
Number
Ventana DVR en minutos (override por stream)
cdn.dvr_retention_time
Number
Retención de segmentos en minutos
Control de Acceso
Campo
Tipo
Descripción
closed_access
Boolean
Requiere autenticación
access_rules.geo
Object
{ enabled, allow, countries[] }
access_rules.cellular
Object
{ enabled, allow, use_client_side }
access_rules.devices
Object
{ deny_mobile, deny_tv, use_client_side }
access_rules.referer
Object
{ enabled, allow, referers[] }
access_rules.ip
Object
{ enabled, allow, ips[] }
access_rules.asn
Object
{ enabled, allow, asns[] }
access_rules.concurrency
Object
{ enabled, limit }
access_restrictions
Object
{ enabled, rule: AccessRestriction ref }
viewing_time_limit
Object
{ enabled, seconds, user_unit, user_time }
Publicidad y Monetización
Campo
Tipo
Descripción
ad
ObjectId
Referencia a configuración de ad principal
referer_ad
Array
[{ ad: [Ad IDs], referer: [String] }] — ads por referer
ad_text
String
Texto de countdown durante ad
ad_insertion
ObjectId
Ad configuration para SSAI
ad_insertion_interval
Number
Minutos entre ad breaks (default: 5)
ad_insertion_google
Object
{ enabled, asset_key, asset_key_dash } — Google Ad Manager
is_adswizz
Boolean
Integración Adswizz habilitada
adswizz_companion
Object
{ afrUrl, companionZoneId, fallbackCompanionZoneId }
Player y Reproducción
Campo
Tipo
Descripción
player_skin
String
Skin del player
player
ObjectId
Referencia a configuración Player
player_custom_js
Array
Scripts JS personalizados
mobile
Object
{ enabled, url } — URL mobile alternativa
zoom
Object
{ streaming, meet_id } — Integración Zoom
url
String
URL externa del stream
Logo y Visuales
Campo
Tipo
Descripción
logo.live.enabled
Boolean
Logo visible en reproducción
logo.live.url
String
URL de imagen del logo
logo.live.position
String
Posición: control-bar, top-left, etc.
thumbnails
Array
[{ name, url, is_default }]
EPG y Programación
Campo
Tipo
Descripción
epg
ObjectId
Referencia a origen EPG
epg_mask
Object
{ mask: EpgMask ref }
Integraciones AWS MediaLive
Ver sección [[#MediaLive (AWS)]] para detalle completo.
Integraciones AWS MediaPackage
Ver sección [[#MediaPackage (AWS)]] para detalle completo.
CDN Externo
Campo
Tipo
Descripción
external_cdn.enabled
Boolean
Usar CDN externo
external_cdn.edge_url
String
URL del edge externo
external_cdn.dash_enabled
Boolean
DASH en CDN externo
external_cdn.dash_edge_url
String
URL edge para DASH
external_cdn.uuid
String
UUID para DRM
[!info] Prioridad de CDN Si external_cdn.enabled === true, se usa la edge URL externa. De lo contrario, se usa el CDN interno (output de MediaLive/MediaPackage).
Live Editor y Playout
Campo
Tipo
Descripción
live_editor.url
String
URL del live editor
live_editor.enabled
Boolean
Habilitado
multiple_clips
Boolean
Multi-clip playout
nowplaying
Boolean
Envío de metadatos now-playing
playout.enabled
Boolean
Playout activo
playout.playout
ObjectId
Referencia a LiveStreamPlayout
Monitoreo e Integraciones
Campo
Tipo
Descripción
metadata.enabled
Boolean
Metadatos habilitados
metadata.icecast_mask
Object
Config de icecast
monitor.notify
Array
Canales de notificación
monitor.status
String
Estado de monitor
monitor.error
Array
Errores registrados
gracenote.record_all
Boolean
Grabar todos los eventos Gracenote
gracenote.live_id
String
ID de canal en Gracenote
itg.enabled
Boolean
Integración ITG habilitada
itg.channel
String
Canal ITG
peering.enabled
Boolean
CDN peering habilitado
distribution_policy
ObjectId
Política de distribución
priority
Number
Prioridad de distribución
--------------------------------------------------------------------------------
Modelo de Datos — Grabaciones
Colección MongoDB: event_recordings
Campo
Tipo
Descripción
_id
ObjectId
Identificador único
event
ObjectId
Stream al que pertenece
account
ObjectId
Cuenta propietaria
media
ObjectId
Media creada al iniciar la grabación
recording
Boolean
Flag de grabación activa
date_created
Date
Fecha de creación del registro
date_start
Date
Inicio de grabación
date_end
Date
Fin de grabación
--------------------------------------------------------------------------------
Modelo de Datos — Schedules
Colección MongoDB: event_schedules
Campo
Tipo
Descripción
_id
ObjectId
Identificador único
event
ObjectId
Stream asociado
account
ObjectId
Cuenta propietaria
code
String
Código del programa
name
String
Nombre del programa
description
String
Descripción
date_start
Date
Inicio del bloque
date_end
Date
Fin del bloque
for_recording
Boolean
Bloque destinado a grabación
recorded
Boolean
Ya fue grabado
is_featured
Boolean
Destacado en EPG
is_recording
Boolean
Grabando actualmente
is_auto_publish
Boolean
Auto-publicar grabación al terminar
is_blackout
Boolean
Bloque de blackout (sin señal)
monetizable
Boolean
Bloque monetizable
not_sellable
Boolean
No vendible
access_rules
Object
Reglas geo/blackout heredables
custom
Object
Atributos custom
categories
String[]
Categorías
media
ObjectId
Media publicada (si fue grabado y publicado)
live_restreaming
ObjectId[]
Destinos de restream para este bloque
date_created
Date
Fecha de creación
date_updated
Date
Última actualización
Campos Virtuales (Schedule)
Virtual
Descripción
is_current
true si la fecha actual está entre date_start y date_end
is_past
true si date_end < ahora
is_future
true si date_start > ahora
--------------------------------------------------------------------------------
Modelo de Datos — Restreaming
Colección MongoDB: event_restreaming
Campo
Tipo
Descripción
_id
ObjectId
Identificador único
event
ObjectId
Stream de origen
account
ObjectId
Cuenta propietaria
name
String
Nombre del destino
type
String
custom o social
status
String
Ver [[#Estados de Restreaming]]
publishing_point
String
URL RTMP/SRT (tipo custom)
stream_id
String
Stream key (tipo custom)
stream_profile
String
Perfil de encoding a usar
social_id
String
ID de página/canal en red social
social_type
String
facebook, youtube, twitch, etc.
title
String
Título del evento en la plataforma social
description
String
Descripción del evento
currentJob
ObjectId
Job de restream activo
Estados de Restreaming
Estado
Descripción
STOPPED
Detenido
STOPPING
En proceso de detención
STARTING
Iniciando
CONNECTING
Conectando al destino
RUNNING
Transmitiendo activamente
ERROR
Error en la retransmisión
--------------------------------------------------------------------------------
Modelo de Datos — Playout
Colección MongoDB: live_stream_playout
Campo
Tipo
Descripción
_id
ObjectId
Identificador único
account
ObjectId
Cuenta propietaria
name
String
Nombre del playout
description
String
Descripción
enabled
Boolean
Playout activo
loop
Boolean
Repetir al terminar
medias
Array
Lista de clips (ver abajo)
start_time
Date
Inicio de reproducción
end_time
Date
Fin de reproducción
pause_diff
Number
Offset de pausa en segundos
last_index
Number
Índice del último clip reproducido
total_segments
Number
Total de segmentos
duration
Number
Duración total en segundos
renditions
Number[]
Resoluciones comunes entre todos los clips
Estructura de Cada Media en Playout
Campo
Tipo
Descripción
media
ObjectId
Referencia a Media
duration
Number
Duración en milisegundos
start_time
Date
Inicio de este clip
end_time
Date
Fin de este clip
index
Number
Posición en la lista
clip_index
Number
Índice de clip
first_segment
Number
Primer segmento HLS
skip
Boolean
Saltar en reproducción
renditions
Array
[{ path, resolution_height }]
Campos Virtuales (Playout)
Virtual
Descripción
online
true si `enabled && (loop
current
Para media items: true si es el que está reproduciendo ahora
--------------------------------------------------------------------------------
Modelo de Datos — Metadatos
Colección MongoDB: live_metadata
Campo
Tipo
Descripción
_id
ObjectId
Identificador único
account
ObjectId
Cuenta propietaria
live_stream
ObjectId
Stream al que pertenece
actionName
String
Tipo de acción de metadato
payload
Object
Contenido (tags ID3, now-playing, etc.)
date_created
Date
Fecha de envío
--------------------------------------------------------------------------------
Modelo de Datos — Ad Breaks
Colección MongoDB: event_ad_breaks
Campo
Tipo
Descripción
_id
ObjectId
Identificador único
event
ObjectId
Stream al que pertenece
account
ObjectId
Cuenta propietaria
date
Date
Cuándo ejecutar el ad break
duration
Number
Duración en milisegundos
spliceEventID
Number
ID SCTE-35 del evento
ad
ObjectId
Configuración de ad a usar
--------------------------------------------------------------------------------
Control de Acceso
El módulo soporta múltiples capas de restricción independientes:
Por Geografía (Geo)
Lista de códigos de país ISO 3166 en access_rules.geo.countries
Modo allow: solo países listados pueden ver
Modo deny: países listados están bloqueados
Puede heredarse a schedules hijos
Por Tipo de Red (Cellular)
Bloquear/permitir redes móviles
Opción use_client_side: detección vía user agent en el cliente
Por Dispositivo
Campo
Efecto
deny_mobile
Bloquea smartphones y tablets
deny_tv
Bloquea smart TVs
use_client_side
Detección en cliente en vez de servidor
Por Referer
Whitelist o blacklist de dominios referer
Útil para embeds exclusivos en sitios específicos
Por IP
Lista de IPs o rangos CIDR en modo allow/deny
Por ASN (Autonomous System Number)
Control por proveedor de internet/red
Por Concurrencia
Límite máximo de espectadores simultáneos
Útil para eventos exclusivos con cupo limitado
Tiempo de Visualización
viewing_time_limit.enabled: activa el límite
viewing_time_limit.seconds: segundos máximos de reproducción
Acceso Cerrado (closed_access)
Requiere acc_token válido en URL embed o header
Se puede combinar con cualquier otra regla
--------------------------------------------------------------------------------
Perfiles de Encoding
Presets Disponibles
Preset
Resolución
Uso Recomendado
HD-1920p
1920×1080
Ultra HD / cinema
HD-1920p-QVBR
1920×1080
Ultra HD con calidad variable
HD-1080p
1920×1080
Alta definición completa
HD-1080p-QVBR
1920×1080
HD con bitrate variable
HD-1080p-Only
1920×1080
Solo 1080p sin rendiciones menores
HD-1280p
1280×720
HD educación
HD-1280p-Education
1280×720
Optimizado para webinars
HD-1024p
1024×576
HD intermedio
HD-960p
960×540
HD compacto
HD-720p
1280×720
Alta definición estándar
HD-720p-Education
1280×720
Webinars / educación
HD-720p-Only
1280×720
Solo 720p
SD
Variable
Definición estándar (múltiples variantes de aspecto)
Campos por Perfil Custom
Campo
Tipo
Descripción
enabled
Boolean
Perfil activo
profile
String
Nombre del preset o etiqueta
video_bitrate
Number
Bitrate de video
video_codec
String
Codec de video
audio_bitrate
Number
Bitrate de audio
audio_codec
String
Codec de audio
resolution.width
Number
Ancho en píxeles
resolution.height
Number
Alto en píxeles
recording
Boolean
Incluir este perfil en grabaciones
--------------------------------------------------------------------------------
DVR y Timeshift
El DVR permite a los espectadores pausar y retroceder el stream en vivo dentro de una ventana de tiempo definida.
Configuración
Campo
Ubicación
Descripción
dvr
Event
Habilita DVR en este stream
cdn.dvr_time
Event
Ventana DVR en minutos (override por stream)
cdn.dvr_time
Account
Ventana DVR por defecto de la cuenta
cdn.dvr_retention_time
Account/Event
Cuánto tiempo retener segmentos
Endpoint DVR
GET /live-stream-playlist/:id/dvr
Retorna un manifiesto HLS especial que expone el buffer DVR completo. El cliente calcula la ventana de seeking basándose en los segmentos disponibles.
Comportamiento
La ventana DVR se calcula en el cliente a partir de la disponibilidad de segmentos
El tamaño máximo de ventana está limitado por dvr_time
La retención define cuánto tiempo persisten los segmentos antes de eliminarse
Compatible con el módulo de clips (extracción de segmentos del DVR)
--------------------------------------------------------------------------------
MediaLive (AWS)
MediaLive es el servicio de transcoding en la nube de AWS integrado en el módulo Live.
Configuración Principal (medialive)
Campo
Tipo
Descripción
enabled
Boolean
MediaLive habilitado para este stream
region
String
Región AWS (ej: us-east-1)
inputsType
String
Tipo de input de ingest
low_latency_enabled
Boolean
Modo baja latencia
isPortrait
Boolean
Formato vertical (9:16)
isFilm
Boolean
Formato cinematográfico
auto_recording
Boolean
Grabar automáticamente al iniciar canal
Tipos de Input
Tipo
Descripción
RTMP_PUSH
Encoder RTMP push (OBS, Wirecast, etc.)
SRT_CALLER
SRT donde MediaLive inicia la conexión
SRT_LISTENER
SRT donde el encoder se conecta a MediaLive
FAST_CHANNEL
Modo fast channel simplificado
Control Automático
Campo
Tipo
Descripción
work_with_schedules.enabled
Boolean
Auto start/stop según schedules
work_with_schedules.start_before_time
Number
Minutos antes del schedule para iniciar
work_with_schedules.stop_after_time
Number
Minutos después del schedule para detener
no_signal_turnoff_transcoding.enabled
Boolean
Apagar canal si no hay señal
no_signal_turnoff_transcoding.stop_after_time
Number
Minutos sin señal antes de apagar
[!tip] Ahorro de Costos AWS Configurar no_signal_turnoff_transcoding ahorra costos en streams desatendidos que pierden señal del encoder.
Captions y Audio
Campo
Descripción
captions.convert608To708
Convierte captions CEA-608 a 708
captions.scte20Detection
Detección de captions SCTE-20
captions.labels
Labels de pistas de captions
audioSelector.languages
[{ code, name }] — Selección de idiomas de audio
Motion Graphics
Campo
Descripción
motionGraphics.enabled
Gráficos en movimiento habilitados
motionGraphics.url
URL del asset de gráficos
motionGraphics.username
Credenciales de acceso
motionGraphics.password
Credenciales de acceso
motionGraphics.duration
Duración de visualización
Canal MediaLive (medialive.channel)
Campo
Descripción
id
ID del canal en AWS MediaLive
state
Estado actual: IDLE, START, STOP
inputs
[{ id, endpoint, streamKey, type, sourceUrl }] — Puntos de ingest
flows
[{ flowArn, egressIp, source{}, whitelistCidr }] — AWS Elemental Link flows
Estados del Canal MediaLive
Estado
Descripción
IDLE
Canal detenido, no transcoding
START
Transcoding activo, señal siendo procesada
STOP
Canal deteniéndose o detenido
--------------------------------------------------------------------------------
MediaPackage (AWS)
MediaPackage gestiona el packaging y distribución de los streams transcodificados.
Configuración (mediapackage)
Campo
Descripción
enabled
MediaPackage habilitado
drm
DRM habilitado vía MediaPackage
uuid
UUID del canal (usado para tokens DRM)
channel.id
ID del canal en AWS MediaPackage
channel.ingest
[{ url, user, password }] — Endpoints de ingest
Endpoints de Output
Tipo
Campo
Descripción
HLS
mediapackage.hls
{ distribution, id }
CMAF
mediapackage.cmaf
{ distribution, id }
DASH
mediapackage.dash
{ distribution, id }
CloudFront
Campo
Descripción
mediapackage.cloudfront.id
ID de distribución CloudFront
mediapackage.cloudfront.tagId
Tag identifier
mediapackage.cloudfront.domain
Dominio CloudFront asignado
Formato de URL CloudFront:
https://{distribution}.mediapackage.us-east-1.amazonaws.com/out/v1/{channel_id}/manifest.{format}
Formatos soportados: .m3u8 (HLS/CMAF), .mpd (DASH)
--------------------------------------------------------------------------------
Estados y Ciclo de Vida
Estado del Stream
OFFLINE (online: false)
    │
    ▼ toggle-online
ONLINE (online: true)
    │
    ├── recording: false (solo streaming)
    │
    └── start-record ──► recording: true
                              │
                              └── stop-record ──► recording: false
                                                       │
                                                       └── Media creada
Archivo de Estado Público
Cuando cambia el estado online, se escribe un archivo JSON en:
/public/events/{event_id}.json
Este archivo es consumido por el player para indicar disponibilidad del stream sin hacer polling a la API.
--------------------------------------------------------------------------------
Módulos Conectados
[!note] Alcance de esta sección Esta sección describe brevemente cada módulo conectado y cómo se relaciona con Live Streams. Cada módulo tiene su propia documentación detallada.
[[EPG]] (Electronic Program Guide)
Vincula el stream a programación televisiva estructurada. Se sincroniza vía /api/live-stream/:id/epg/sync. Soporta reconciliación y formateo de atributos custom. Puede disparar grabación y auto-publicación basadas en bloques de programación.
[[DVR]] / Clips
Módulo de reproducción con timeshift. Usa el endpoint /live-stream-playlist/:id/dvr. Gestiona ventana DVR y políticas de retención. Permite creación de clips desde segmentos DVR.
[[Ads]] (Publicidad)
Gestiona configuraciones de anuncios referenciadas por ad y ad_insertion en el stream. Soporta pre-roll, mid-roll vía SCTE-35, SSAI y Google Ad Manager. Ver también [[#Endpoints de API — Publicidad]].
[[Embed Player]] (Lightning Player)
Player HTML5 moderno que consume los endpoints de embed. Soporta DRM, estilos custom, logo, análitica y múltiples protocolos. Se configura vía query params en la URL de embed o vía player y player_skin.
[[Media]] (VOD)
Grabaciones de streams en vivo se convierten automáticamente en objetos Media al finalizar. Schedules con is_auto_publish publican directamente a Media. El módulo Live referencia Media en playout y grabaciones.
[[Live Editor]] / Playout
Permite reproducir clips VOD durante una transmisión en vivo. Requiere playout.enabled y referencia a un LiveStreamPlayout. Soporta multi-clip y transcripción de clips.
[[Restreaming Social]]
Retransmisión a Facebook, YouTube, Twitch y destinos RTMP/SRT custom. Puede activarse manualmente o asociarse a schedules específicos.
[[Transcripción AI]]
Transcripción de audio a texto en tiempo real. Requiere flag ops.ai.live_transcription en la cuenta. Usa servicio externo VMS.
[[Gracenote]]
Enriquecimiento de metadatos para canales de música/deportes. Requiere flag gracenote.enabled en la cuenta. Sincroniza datos de programación con Gracenote vía gracenote.live_id.
[[ITG]] (Audience Insights)
Métricas interactivas de audiencia. Requiere flag itg.enabled en la cuenta. Se configura con itg.channel.
[[Access Restrictions]]
Módulo de reglas de acceso reutilizables. Se referencia en access_restrictions.rule. Permite centralizar políticas de acceso aplicables a múltiples streams.
[[Distribution Policy]]
Políticas de distribución CDN aplicables por stream. Referenciado en distribution_policy.
[[Fast Channels]]
Canal simplificado de bajo costo. Referenciado en fastChannelReference. Usa medialive.inputsType = FAST_CHANNEL.
[[Analytics]] (Youbora / Comscore / Mux / GA)
Integrado en el player embed. No requiere configuración en el modelo del stream. Se configura a nivel de cuenta o player skin.
--------------------------------------------------------------------------------
Comportamientos Especiales y Restricciones
Live Moments (DEPRECADO)
[!warning] Feature Deprecado El endpoint /api/live-stream/:id/moment retorna 410 Gone. No usar. Los momentos han sido reemplazados por clips/DVR.
Selección de CDN
El stream usa en orden de prioridad:
external_cdn si external_cdn.enabled === true
MediaPackage/CloudFront si mediapackage.enabled === true
CDN interno por defecto
Protocolo de Reproducción
El player selecciona protocolo en este orden:
preferred_protocol del stream
Detección automática por dispositivo/navegador
Fallback a HLS como protocolo base
RTMP/RTMPT si está configurado para dispositivos legacy
Duración del Playout
Duración total = suma de duraciones de clips no marcados como skip
El soporte de loop resetea segmentos al offset configurado en loop_last_segment
El cliente maneja el seeking dentro de ventanas calculadas
Restricciones de Concurrencia
El límite de concurrencia se evalúa en el servidor
Superar el límite retorna error 429 Too Many Requests
El contador se actualiza vía heartbeat del player
Caché de Manifiestos HLS/DASH
TTL configurable entre 30 y 60 segundos
Los tokens ADMIN bypasean el caché completamente
La clave de caché incluye la versión de política de acceso para invalidar correctamente al cambiar reglas
--------------------------------------------------------------------------------
Diagnóstico de Problemas Comunes
[!tip] Guía de Diagnóstico Rápido
Stream No Reproduce
Verificar online === true en el documento del stream
Verificar que el encoder esté enviando señal al publishing_token / stream_id
Verificar medialive.channel.state === START si usa MediaLive
Revisar monitor.error en el documento del stream
Verificar cdn_zones coincida con la zona del account
Probar manifiesto directamente: GET /live-stream-playlist/:id.m3u8
Grabación No Inicia
Verificar online === true
Verificar que al menos un encoding profile tenga enabled: true y recording: true
Verificar que la cdn_zone del account coincida con las del evento
Revisar logs del endpoint POST /api/live-stream/:id/start-record
Acceso Denegado al Stream
Verificar closed_access — si true, necesita acc_token válido
Revisar access_rules.geo — verificar país del usuario
Revisar access_rules.referer — verificar dominio de la petición
Revisar access_rules.ip — verificar IP del usuario
Revisar access_rules.concurrency — verificar si alcanzó el límite
Usar GET /api/live-stream/:id/access para obtener el diagnóstico de acceso
DVR No Funciona
Verificar dvr === true en el stream
Verificar que cdn.dvr_time esté configurado (stream o account)
Verificar que la ventana DVR no haya expirado (dvr_retention_time)
Probar el endpoint DVR directamente: GET /live-stream-playlist/:id/dvr
EPG No Sincroniza
Verificar que epg referencie un origen EPG válido
Invocar manualmente POST /api/live-stream/:id/epg/sync
Verificar estado del job de sincronización en gracenote.sync.status
Restream Falla
Verificar status del restream — si es ERROR, revisar logs
Verificar que el publishing_point y stream_id sean correctos
Para redes sociales: verificar que el token de autorización social no haya expirado
Reintentar via POST /api/live-stream/:id/restream/:restream_id/stop y luego start
Ad Insertion No Aparece
Para SCTE-35: verificar medialive.enabled === true (solo funciona con MediaLive)
Para Google Ad Manager: verificar ad_insertion_google.enabled y asset_key
Verificar ad_insertion_interval (default: 5 minutos)
Verificar que el ad referenciado exista y tenga configuración válida
--------------------------------------------------------------------------------

Platform API
v7.0.22
OAS3
Overview
The platform offers a RESTful interface to interact with most of its components (Media, Live Stream, Ads, etc). By RESTful we mean the API will make proper use of HTTP verbs and response codes.
Responses
All responses deliver a proper HTTP status code and a JSON payload with a status and data object. The status object is a string with the OK value to indicate a successful operation or ERROR to indicate otherwise. The data object, which in some cases can be null, usually contains data about the requested resource and can be of type String, Number, Array or Object.
JSON Payload example:

{
  "status": "OK",
  "data": ...
}

Errors
Along with the JSON payload, errors are reported with a 4xx or 5xx HTTP status code.
Error examples:
HTTP 401 - Unauthorized. The request is being made with an expired authorization token or one without the proper permissions.
HTTP 404 - Not Found. The requested resource doesn't exists.
HTTP 500 - Internal Server Error. The request wasn't fullfiled because of a server error.
Endpoint & Security
The API's base endpoint is https://platform.mediastre.am/. Altough a secure (https) and non-secure (http) version is available, we highly recommend using the secure endpoint to protect your content and authorization tokens.
Versioning
Currently the API doesn't allow you to select a specific version. Breaking changes are infrequent to non existing and in the case of such modifications all customers are properly notified.
Authorization & Permissions
All requests must include an API authorization token.
A token must be passed with one of this methods:
The token query parameter
The X-API-Token header
A token can have read or read+write permissions. Resources accessed through the GET verb usually require a token with read permissions while POST and DELETE require read+write permissions.
Please note that tokens also have an expiration date. Before making a request, please make sure you are using a valid token with proper permissions.
You can issue authorization tokens in your account settings under "API & Tokens".
The API allows you to consume an specific Media or Live Stream and must be issued using the Issue method of the Access Token API
POST
/api/access/issue
Allows to issue a new Access Token for an specific Media or Live Stream
read permissions are required to access this resource When you enable "Closed Access" on a Media or Live Stream, the platform will require for an Access Token to be provided in the embed or playlist/video URL per reproduction.
Some important properties about an Access Token: Can be used only once (every new reproduction requires a new Access Token) Must be used within 30 minutes of its issuing date Automatically expires after 6 hours of its issuing date (this means video reproduction will stop after the token has expired)
Usage Example: Embed
<iframe src="https://mdstrm.com/embed/502de05313c18fea0800009a?access_token=XfD5xl27myDE7z4NaFSllHKZr3FX5fgb7umNgSxdxHc33Y9ACcF935lxzc1voIIUWGDuXIYfHPp"></iframe>
Usage Example: Playlist
http://mdstrm.com/video/502de05313c18fea0800009a.m3u8?access_token=XfD5xl27myDE7z4NaFSllHKZr3FX5fgb7umNgSxdxHc33Y9ACcF935lxzc1voIIUWGDuXIYfHPp
Parameters
Name
Description
id * string (query)
Yes ID of the Media or Live Stream
type * string (query)
Yes Video type. Possible values: media, live
ip string (query)
If provided, playback will ocurr only if the user's public IP address matches this value
user_agent string (query)
If provided, playback will ocurr only if the user's user agent matches this value
time_limit number (query)
If provided, playback will be allowed only for time_limit seconds after token emission
encrypted boolean (query)
(VOD only) If provided, playback will use AES-128 encryption. Currently available only for HLS playback with Mediastream CDN. --truefalse
validation_lock number (query)
When validating the token, multiple requests arriving closer to validation_lock seconds from last validation will not count towards burning the max_use token count.
This API allows you to manage all related to Ads
GET
/api/ad
Return a list of Ads
read permissions are required to access this resource
Parameters
Name
Description
limit integer (query)
Max number of items to return.
skip integer (query)
Item to start pagination.
Responses
Code
Description
Links
200
OK - Return a list of Ads Media type application/json Controls Accept header. Examples Response Example Example Value { "status": "OK", "data": [ { "_id": "5ee1858b824d815cb66e296e", "type": "vast", "name": "ads skippable mid-roll", "date_created": "2020-06-11T01:14:51.850Z", "is_enabled": true }, { "_id": "5ee18323824d815cb66e296b", "type": "vast", "name": "ads skippable pre-roll", "date_created": "2020-06-11T01:04:35.320Z", "is_enabled": true }, { "_id": "5edebe35e6e45a6b12ee7b03", "type": "vast", "name": "ads post-roll", "date_created": "2020-06-08T22:39:49.482Z", "is_enabled": true }, { "_id": "5edeb60c58ea3b58a8bd6b6a", "type": "vast", "name": "ads ima post-roll", "date_created": "2020-06-08T22:05:00.765Z", "is_enabled": true } ] }
No links
GET
/api/ad/search
Search Ads
read permissions are required to access this resource
Parameters
Name
Description
id string (query)
The id of the Ad
name string (query)
The name of the Ad
Responses
Code
Description
Links
200
OK - Return the search result Media type application/json Controls Accept header. Examples Response Example Example Value { "status": "OK", "data": [ { "_id": "5ee1858b824d815cb66e296e", "type": "vast", "name": "ads skippable mid-roll" }, { "_id": "5ee18323824d815cb66e296b", "type": "vast", "name": "ads skippable pre-roll" }, { "_id": "5edebe35e6e45a6b12ee7b03", "type": "vast", "name": "ads post-roll" }, { "_id": "5edeb60c58ea3b58a8bd6b6a", "type": "vast", "name": "ads ima post-roll" } ] }
No links
POST
/api/ad/new
Create a new Ad
write permissions are required to access this resource
Parameters
No parameters
Request body
application/x-www-form-urlencodedapplication/json
name string
Name of the new Ad
type string
Any of vast, googleima, local, ad-insertion or adswizz. Default vast
is_enabled boolean
Enable or disbale the Ad
preroll_skip_at number
Time in seconds where the adevertising appears
min_media_time_length number
Time in seconds where the adevertising appears
insertion object
schedule object
adswizz object
categories array
tags array
referers array
Responses
Code
Description
Links
200
OK - Return the new Ad Media type application/json Controls Accept header. Examples Response Example Example Value { "status": "OK", "data": { "__v": 0, "account": "5e4d40208299556e040333e3", "type": "vast", "name": "Ads post-roll", "_id": "5f04d6801d74dd3ec1a5804f", "min_media_time_length": 0, "referers": [], "categories": [], "tags": [], "date_created": "2020-07-07T20:09:36.441Z", "adswizz": { "zone": null }, "insertion": null, "schedule": { "overlay": { "position": "0" }, "mid": [], "post": { "media": null, "tag": null }, "pre": { "media": null, "tag_mobile": null, "tag": null } }, "preroll_skip_at": 0, "is_enabled": false } }
No links
400
Bad Request - Wrong minimum time Media type application/json Examples Response Example Example Value { "status": "ERROR", "data": { "code": "AD_BAD_MIN_MEDIA_TIME", "message": "The minimum time must be greater or equal to 0." } }
No links
500
Internal Server Error - An error occurred with database Media type application/json Examples Response Example Example Value { "status": "ERROR", "data": "DB_ERROR" }
No links
GET
/api/ad/{ad_id}
Get an existing Ad data
read permissions are required to access this resource
Parameters
Name
Description
ad_id * string (path)
The id of the Ad
Responses
Code
Description
Links
200
OK - Return the Ad data Media type application/json Controls Accept header. Examples Response Example Example Value { "status": "OK", "data": { "_id": "5ee259a22af85f6bf4f411f6", "account": "5a83600298649173f39357a3", "type": "vast", "name": "Ads Pre-roll", "__v": 11, "min_media_time_length": 0, "referers": [], "categories": [], "tags": [], "date_created": "2020-06-11T16:19:46.551Z", "adswizz": { "zone": null }, "insertion": null, "schedule": { "overlay": { "position": "0", "tag": null }, "mid": [], "post": { "media": null, "tag": null }, "pre": { "media": null, "tag_mobile": "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=", "tag": "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=" } }, "preroll_skip_at": 0, "is_enabled": true } }
No links
404
Not Found - The Ad does not exist Media type application/json Examples Response Example Example Value { "status": "ERROR", "data": "NOT_FOUND" }
No links
POST
/api/ad/{ad_id}
Update an existing Ad
write permissions are required to access this resource
Parameters
Name
Description
ad_id * string (path)
The id of the Ad
Request body
application/x-www-form-urlencodedapplication/json
name string
Name of the new Ad
type string
Any of vast, googleima, local, ad-insertion or adswizz. Default vast
is_enabled boolean
Enable or disbale the Ad
preroll_skip_at number
Time in seconds where the adevertising appears
min_media_time_length number
Time in seconds where the adevertising appears
insertion object
schedule object
adswizz object
categories array
tags array
referers array
Responses
Code
Description
Links
200
OK - Return the updated Ad Media type application/json Controls Accept header. Examples Response Example Example Value { "status": "OK", "data": { "__v": 0, "account": "5e4d40208299556e040333e3", "type": "vast", "name": "Ads post-roll", "_id": "5f04d6801d74dd3ec1a5804f", "min_media_time_length": 0, "referers": [], "categories": [], "tags": [], "date_created": "2020-07-07T20:09:36.441Z", "adswizz": { "zone": null }, "insertion": null, "schedule": { "overlay": { "position": "0" }, "mid": [], "post": { "media": null, "tag": null }, "pre": { "media": null, "tag_mobile": null, "tag": null } }, "preroll_skip_at": 0, "is_enabled": false } }
No links
400
Bad Request - Wrong minimum time Media type application/json Examples Response Example Example Value { "status": "ERROR", "data": { "code": "AD_BAD_MIN_MEDIA_TIME", "message": "The minimum time must be greater or equal to 0." } }
No links
404
Not Found - The Ad does not exist Media type application/json Examples Response Example Example Value { "status": "ERROR", "data": "NOT_FOUND" }
No links
500
Internal Server Error - An error occurred with database Media type application/json Examples Response Example Example Value { "status": "ERROR", "data": "DB_ERROR" }
No links
DELETE
/api/ad/{ad_id}
Remove an existing Ad
delete permissions are required to access this resource
Parameters
Name
Description
ad_id * string (path)
The id of the Ad
Responses
Code
Description
Links
200
OK - Return if Ad was removed Media type application/json Controls Accept header. Examples Response Example Example Value { "status": "OK", "data": "null" }
No links
404
Not Found - The Ad does not exist Media type application/json Examples Response Example Example Value { "status": "ERROR", "data": "NOT_FOUND" }
No links
This API allows you to manage everything related to Article
GET
/api/article
Returns list of articles, the data can be filtered as a search
POST
/api/article
Create a new article
GET
/api/article/{article_id}
Get an article data
POST
/api/article/{article_id}
Update an article
DELETE
/api/article/{article_id}
Delete an article data
GET
/api/article/search
Returns list of articles, the data can be filtered as a smart search
This API allows you to manage all related to Category
GET
/api/category
Search for categories
Parameters
Name
Description
category_name string (query)
The search term for a category, if it's empty return all
full boolean (query)
Determines if full path is to be displayed in the name --truefalse
with_count boolean (query)
Determines if it will return categories with count of childrens --truefalse
Responses
Code
Description
Links
200
OK - Returns a list of categories Media type application/json Controls Accept header. Examples Search allSearch by name Example Value { "status": "OK", "data": [ { "_id": "5ee7f3b8927eb9437bb4f239", "slug": "audio", "description": "My new category audios", "name": "Audios", "filter_categories": [ "5ee7d68727bd6a32b42f8ede" ], "date_created": "2020-06-15T22:18:32.891Z", "account": "5ee7f3b8927eb9437bb4f239", "drm": { "allow_incompatible_devices": false, "allow": true, "enabled": true }, "track": true, "visible": false }, { "_id": "5ee7d68727bd6a32b42f8ede", "slug": "videos", "description": "My new category videos", "name": "Videos", "filter_categories": [ "5ee7d68727bd6a32b42f8ede" ], "date_created": "2020-06-15T20:13:59.813Z", "account": "5e4d40208299556e040333e3", "drm": { "allow_incompatible_devices": false, "allow": true, "enabled": true }, "track": true, "visible": false } ] }
No links
POST
/api/category
Create a new category
GET
/api/category/{category_id}
Get an existing category
POST
/api/category/{category_id}
Update an existing category
DELETE
/api/category/{category_id}
Delete an existing category
POST
/api/category/{category_id}/image
Adds an image to a category
DELETE
/api/category/{category_id}/image
Remove the image of the category
POST
/api/category/{category_id}/media
Assigns a category to a media
This API allows you to manage everything related to Mediastream CDN
This API allows you to manage all related to Channel
This API allows you to manager customer coupons
Customer orders (purchases). Products and payment methods must be configured in the MediaStream platform UI (admin session), not via the public API token. Same API token as other Customer resources (GET → read, POST → read+write).
Payment attempts and charges for a purchase (and account-wide payment queries). Gateway must match the product payment method. Same API token as Customer APIs.
This API allows you to log a Customer in
This API allows you to manage all related to Customer
This API allows you to manage all related to Images
This API allows you to manage all related to Live Stream
This API allows you to get lookup values
This API allows you to manage all related to Machine Learning module
The API allows you to upload media files using API
This API allows you to manage all related to Medias
This API allows you to manage all related to media playlists
The API allows you to upload an image logo related to a reseller
This API allows you to manage all related to Customer
This API allows you to manage all related to Seller
This API allows you to manage all related to Reseller
This API allows you to read access restrictions data
This API allows you to manage all related to Episode
The API allows you to upload an image related to a module
This API allows you to interact with documents related to shows, as Producers, Distributors, Hosts, and Featured
This API allows you to manage all related to Season
This API allows you to manage all related to Show
POST
/api/live-stream/{live_stream_id} (Cloud Transcoding)
Set Cloud Transcoding status
GET
/api/live-metadata/{live_stream_id}/metadata
Retrieve live stream metadata
This endpoint retrieves metadata related to a specific live_stream_id.
Parameters
Name
Description
live_stream_id * string (path)
The ID of the live stream
dateStart string($date-time) (query)
Start date and time for the query period, in ISO8601 format
dateEnd string($date-time) (query)
End date and time for the query period, in ISO8601 format
skip integer (query)
Number of records to skip (for pagination) Default value : 0
limit integer (query)
Limit of records to return (for pagination) Default value : 100
Responses
Code
Description
Links
200
Metadata list for the live stream Media type application/json Controls Accept header. Example Value Schema { "version": "1.0.1", "data": [ { "id": "66f9a48085b06087b2c61a33", "account": "64a2f7945ea2ca18c978b025", "event": "64addf1ef36ef35077f2997e", "dateStart": "2024-09-29T17:57:54+00:00", "dateEnd": "2024-09-29T18:00:00+00:00", "type": "SONG", "title": "Volviendo a Casa", "subtitle": "Rata Blanca on concert", "image": "https://i.scdn.co/image/ab67616d0000b273a9741dfe5bb18a54560102ab", "extradata": { "year": 2002 } } ] }
No links
400
Bad request
No links
404
Stream not found
No links
500
Internal server error
No links
POST
/api/live-metadata/{live_stream_id}/metadata
Add metadata to a live stream
This endpoint allows adding new metadata for a specific live_stream_id.
Parameters
Name
Description
live_stream_id * string (path)
The ID of the live stream
Request body
application/json
Example Value
Schema
{
  "dateStart": "2024-09-29T18:00:00+00:00",
  "dateEnd": "2024-09-29T18:03:00+00:00",
  "type": "SONG",
  "title": "Volviendo a Casa - Rata Blanca",
  "subtitle": "Concert at stadium",
  "image": "https://i.scdn.co/image/ab67616d0000b273a9741dfe5bb18a54560102ab",
  "extradata": {
    "year": 2002
  }
}
Responses
Code
Description
Links
200
Metadata successfully added Media type application/json Controls Accept header. Example Value Schema { "version": "1.0.1", "data": { "id": "66f9a5af85b06087b2c61a60", "account": "64a2f7945ea2ca18c978b025", "event": "64addf1ef36ef35077f2997e", "dateStart": "2024-09-29T18:00:00+00:00", "dateEnd": "2024-09-29T18:03:00+00:00", "type": "SONG", "title": "Volviendo a Casa - Rata Blanca", "subtitle": "Concert at stadium", "image": "https://i.scdn.co/image/ab67616d0000b273a9741dfe5bb18a54560102ab", "extradata": { "year": 2002 } } }
No links
400
Bad request - Missing or invalid fields Media type application/json Example Value Schema { "data": "MISSING_OR_INVALID_DATE_START" }
No links
500
Internal server error
No links
POST
/api/live-metadata/{live_stream_id}/metadata/{metadata_id}
Update metadata for a live stream
This endpoint allows updating metadata for a specific live_stream_id and metadata_id.
Parameters
Name
Description
live_stream_id * string (path)
The ID of the live stream
metadata_id * string (path)
The ID of the metadata to be updated
Request body
application/json
Example Value
Schema
{
  "dateStart": "2024-09-29T18:00:00+00:00",
  "dateEnd": "2024-09-29T18:03:00+00:00",
  "type": "SONG",
  "title": "Volviendo a Casa - Rata Blanca",
  "subtitle": "Concert at stadium",
  "image": "https://i.scdn.co/image/ab67616d0000b273a9741dfe5bb18a54560102ab",
  "extradata": {
    "year": 2002
  }
}
Responses
Code
Description
Links
200
Metadata successfully updated Media type application/json Controls Accept header. Example Value Schema { "version": "1.0.1", "data": { "id": "66f9a5af85b06087b2c61a60", "account": "64a2f7945ea2ca18c978b025", "event": "64addf1ef36ef35077f2997e", "dateStart": "2024-09-29T18:00:00+00:00", "dateEnd": "2024-09-29T18:03:00+00:00", "type": "SONG", "title": "Volviendo a Casa - Rata Blanca", "subtitle": "Concert at stadium", "image": "https://i.scdn.co/image/ab67616d0000b273a9741dfe5bb18a54560102ab", "extradata": { "year": 2002 } } }
No links
400
Bad request - Missing or invalid fields Media type application/json Example Value Schema { "data": "INVALID_DATE_START" }
No links
404
Not found - Metadata not found for the given ID Media type application/json Example Value Schema { "message": "Metadata not found" }
No links
500
Internal server error
No links
DELETE
/api/live-metadata/{live_stream_id}/metadata/{metadata_id}
Delete metadata from a live stream
This endpoint allows the deletion of a specific metadata entry for a given live_stream_id and metadata_id.
Parameters
Name
Description
live_stream_id * string (path)
The ID of the live stream
metadata_id * string (path)
The ID of the metadata to be deleted
Responses
Code
Description
Links
200
Metadata successfully deleted Media type application/json Controls Accept header. Example Value Schema { "version": "1.0.1", "data": {} }
No links
400
Bad request - Invalid parameters Media type application/json Example Value Schema { "message": "Invalid live_stream_id or metadata_id" }
No links
404
Not found - Metadata not found for the given ID Media type application/json Example Value Schema { "message": "Metadata not found" }
No links
500
Internal server error
No links
Schemas
Ad
{
name
string example: Ads post-roll Name of the new Ad
type
string example: The type of the Ad Any of vast, googleima, local, ad-insertion or adswizz. Default vast
is_enabled
boolean example: true Enable or disbale the Ad
preroll_skip_at
number example: 10 Time in seconds where the adevertising appears
min_media_time_length
number Time in seconds where the adevertising appears
insertion
{...}
schedule
{...}
adswizz
{...}
categories
[...]
tags
[...]
referers
[...]
}
Article
{
title*
string Name of the Article
author
string Author of the Article
synopsis
string Description of the Article
content
string Content of the Article
image_preview
string Main image of the Article
slug
string Slug of the Article
date_created
date Creation date
date_updated
date Last update's date
date_published
date Publish date
available_from
boolean Indicates that start of availability
available_from_date
date Indicates that start of availability date
available_from_hour
number Indicates that start of availability hour
available_from_offset
number Indicates the Timezone offset of the start of availability
available_until
boolean Indicates that end of availability
available_until_date
date Indicates that end of availability date
available_until_hour
number Indicates that end of availability hour
available_until_offset
number Indicates the Timezone offset of the end of availability
is_published
boolean Publishing status. Default: false
tags
[...]
keywords
[...]
images
[...]
medias
[...]
categories
[...]
}
Categories
{
category*
string Category Id
order
integer Category order used by OTT
}
Medias
{
media*
string Media id
isMain
boolean Main media.
order
number Media order
}
Images
{
image*
string Image id
isMain
boolean Main image.
order
number Image order
}
Keywords
{
keyword*
string keywords of the Article
}
Tags
{
tag*
string Tags of the Article
}
Category
{
name*
string Name of the new category
description
string Description of the new category
drm
string Any of all, compatible or deny. If null, drm will not be enable
parent
string ID of the parent category
track
boolean indicates if the catergory will be tracked by analytics
visible
boolean Indicates if the catergory will be visible
}
CDN Certificate
{
_id
string Certificate id
name*
string Certificate name
key
string Certificate SSL Key
crt
string Certificate SSL Crt
chain
string Certificate SSL Chain
}
CDN Distribution
{
_id
string CDN distribution id
name*
string Name of the CDN distribution
active
boolean CDN Distribution active status
url
string Custom CDN host to be used for DNS Resolving
cert
string SSL Certificate id to use for Custom CDN url
origin*
[...]
origin_group
[...]
request_path*
[...]
}
Channel
{
name
string Name of the new channel
facebook_app_id
string Facebook app id
facebook_app_secret
string Facebook app secret
facebook_admin_username
string Facebook admin username
twitter_app_id
string Twitter app id
twitter_app_secret
string Twitter app secret
twitter_admin_username
string Twitter admin username
}
Coupon
{
group*
string The ID of the coupon group.
valid_from
string($date-time) Start date of coupon validity.
valid_to
string($date-time) End date of coupon validity.
is_reusable
boolean Indicates if the coupon is reusable.
max_use
string
customer_max_use
string
quantity
integer minimum: 1 Number of coupons to generate.
discount_type
string Indicates discount type value.
payment_required
boolean Indicates if payment is required to use the coupon.
custom_code
string Custom coupon code (optional).
detail
string Coupon detail (optional).
is_valid
boolean Indicates if the coupon is valid.
metadata
{...}
type
string Type of coupon.
type_code
string Code associated with the coupon type.
days
integer Number of days for subscription coupons (optional).
validity_date
string($date-time) Specific validity date for subscription coupons (optional).
percent
integer minimum: 1 maximum: 100 Percentage discount for percent type coupons (optional).
amount
number Discount amount for amount type coupons (optional).
}
CouponUpdate
{
group
string The ID of the coupon group.
valid_from
string($date-time) Start date of coupon validity.
valid_to
string($date-time) End date of coupon validity.
is_reusable
boolean Indicates if the coupon is reusable.
max_use
string
customer_max_use
string
payment_required
boolean Indicates if payment is required to use the coupon.
detail
string Coupon detail (optional).
is_valid
boolean Indicates if the coupon is valid.
metadata
{...}
type
string Type of coupon.
type_code
string Code associated with the coupon type.
days
integer Number of days for subscription coupons (optional).
validity_date
string($date-time) Specific validity date for subscription coupons (optional).
percent
integer minimum: 1 maximum: 100 Percentage discount for percent type coupons (optional).
amount
number Discount amount for amount type coupons (optional).
}
CustomerPurchase
{
description:
Purchase document
_id
string
account
string
customer
string
status
string Enum: Array [ 3 ]
type
string subscription, ppv, other, one-time
gateway
string
product_id
string
product
{...}
metadata
{...}
payments
[...]
date_created
string($date-time)
valid_until
string($date-time)
}
PurchasePayment
{
_id
string
status
string Enum: Array [ 4 ]
gateway
string
amount
string
currency
string
customer
string
purchase
string
metadata
{...}
date_created
string($date-time)
}
CreatePurchaseBody
{
type
string
product
string Product _id
product_payment_method
string Embedded payment method _id
product_id
string
metadata
{...}
status
string
}
CreatePaymentBody
{
gateway*
string example: stripe
product
string
product_payment_method
string
options
{...}
metadata
{...}
paymentIntent
boolean
coupon
string
}
CustomerSession
{
origin
string Where login request comes from (Default: sm)
type
string Login type. Available options: password, facebook, google or twitter. (Default: password)
id
string Social network id in case of type facebook, google or twitter
email*
string Customer email in case of type password
password*
string Customer password in case of type password
clear
boolean If sent as true, other sessions will be deleted when new session is created
ip_address
string Customer IP address from where session request was sent
user_agent
string Customer User Agent from where session request was sent
}
Customer
{
email*
string Email for the Customer
password*
string Password for the Customer
first_name*
string First name for the Customer
last_name*
string Last name for the Customer
gender
string Gender of the Customer. Posible values 'MALE
birthday
date Birthday date
phone
string Phone of the Customer
origin
string
address
{...}
social
{...}
external
[...]
metadata
string
photo
string
integrator
string
}
Image
{
name
string The name of the person
faceId
string The faceId
oldName
string The old name of the person before make an update
oldCaption
string The old caption title of the image before make an update
newCaption
string The new caption title of the image after make an update
updateCaption
bool If the caption is to be updated
}
CropImage
{
name
string The name of the person
}
EventMetadata
{
account
string($uuid) example: 64a2f7945ea2ca18c978b025 The ID of the account associated with the metadata
event
string($uuid) example: 64addf1ef36ef35077f2997e The ID of the event associated with the metadata
dateStart
string($date-time) example: 2024-09-29T18:00:00+00:00 Start date and time for the metadata, in ISO8601 format
dateEnd
string($date-time) example: 2024-09-29T18:03:00+00:00 End date and time for the metadata, in ISO8601 format
title
string example: Volviendo a Casa - Rata Blanca Title of the metadata content
subtitle
string example: Concert at stadium Subtitle of the metadata content
type
string example: SONG Type of metadata (e.g., SONG, ADVERTISEMENT, etc.)
image
string($uri) example: https://i.scdn.co/image/ab67616d0000b273a9741dfe5bb18a54560102ab URL of the image associated with the metadata
extradata
{...} example: OrderedMap { "year": 2002 }
}
LiveStream
{
name*
string Name of the new Live Stream
cdn_zones*
[...]
encodingProfiles*
[...]
medialive
Medialive{...}
online
boolean Defines Online status. Default: false
closed_access
boolean Defines Closed Access status. Default: false
preferred_protocol
boolean Streaming protocol of preference (when it's possible to choose). Possible values: hls, rtmp, rtmpt. Default: hls
}
Medialive
{
channel
{...}
enabled
boolean Defines Cloud Transcoding enabled status. Defaults false
jobEnabled
boolean Defines Cloud Transcoding run status. Defaults false
profile
String Transcoding Profile. Values HD 1080p, HD 1080p Enhanced QVBR, HD 720p, HD 720p-Education, SD
}
Media
{
title
string Name of the new Media
description
string Description of the new Media
is_published
boolean Defines Media publishing status. Default: false
ad
string Ad id
available_from
boolean Indicates that start of availability date will be modified
available_from_date
date Start of availability date
available_from_hour
number Hour of start of availability date
available_from_offset
number Timezone offset of start of availability date
available_until
boolean Indicates that end of availability date will be modified
available_until_date
date End of availability date
available_until_hour
number Hour of end of availability date
available_until_offset
number Timezone offset of end of availability date
categories
[...]
tags
[...]
custom
{...}
date_recorded
date Date of recording
cellular_restriction
string Defines if Media will be restricted by cellular network. Possible values: allow, deny
closed_access_restriction
string Enables or disables Closed Access property. Possible values: allow, deny
geo_restriction
string Defines if Media will be restricted by geofencing. Possible values: allow, deny
geo_restriction_countries
[...]
device_restriction_deny_mobile
boolean Defines access restriction to mobile devices
device_restriction_deny_tv
boolean Defines access restriction to Smart TVs
duration
number Duration of the media in seconds
show_info
{...}
third_party_cdn_url
string If you use an external cdn other than mediastream, needs the External CDN module enabled
url
string
no_logo
boolean Determine if the media will have a logo or not
type
string The type of the media. Possible values: audio or video
no_ad
boolean Determine if the media will have ads
ad_preroll
boolean Determine if the media will have a preroll ad
ad_postroll
boolean Determine if the media will have a postroll ad
is_pre_published
boolean
referer_restriction
string Referral block. Possible values: allow, deny
companion_media_enabled
boolean Enable or disable Companion Media feature for this media
companion_media
[...]
}
Playlist
{
name
string Name of the Playlist.
description
string Description of the Playlist.
featured
boolean Indicates that the Playlist will be flagged as featured.
categories
[...]
custom
{...}
closed_access_restriction
string Enables or disables Closed Access property. Possible values: allow, deny, default.
geo_restriction
string Defines if the Playlist will be restricted by geofencing. Possible values: allow, deny, default.
geo_restriction_countries
[...]
cellular_restriction
string Defines if the Playlist will be restricted by cellular network. Possible values: allow, deny, default.
device_restriction_deny_mobile
boolean Defines access restriction to mobile devices.
device_restriction_deny_tv
boolean Defines access restriction to Smart TVs.
referer_restriction
string Referral block. Possible values: allow, deny, default.
referer_restriction_list
[...]
ip_restriction
string IP blocking. Possible values: allow, deny, default.
ip_restriction_list
[...]
no_ad
boolean Determine if the Playlist will have ads.
custom_html
[...]
access_tokens
[...]
type
string The type of the Playlist. Possible values: manual, smart, series, playout.
medias
[...]
title
string Media title to associate to the Playlist. Used in the type: smart.
title_rule
string Rule to filter by Media title. Possible values: starts_with, ends_with, contains, is. Used in the type: smart.
smart_categories
[...]
categories_rule
string Rule to filter by Media category ID. Possible values: in_any, in_all, not_in_any, not_in_all. Used in the type: smart.
tags
[...]
tags_rule
string Rule to filter by Media tags. Possible values: in_any, in_all, not_in_any, not_in_all. Used in the type: smart.
created_after
string($date-time) Date to filter the Media created later and associate them to the Playlist. Used in the type: smart.
created_before
string($date-time) Date to filter the Media created earlier and associate them to the Playlist. Used in the type: smart.
recorded_after
string($date-time) Date to filter the Media recorded later and associate them to the Playlist. Used in the type: smart.
recorded_before
string($date-time) Date to filter the Media recorded earlier and associate them to the Playlist. Used in the type: smart.
min_duration
number Associates to the Playlist those media with a duration longer than this number. Used in the type: smart.
min_duration_unit
string Determine the time unit used to filter by longer Media duration. Possible values: s, m, h. Used in the type: smart.
max_duration
number Associates to the Playlist those media with a duration shorter than this number. Used in the type: smart.
max_duration_unit
string Determine the time unit used to filter by shorter Media duration. Possible values: s, m, h. Used in the type: smart.
min_views
number Associates to the Playlist those media with views higher than this number. Used in the type: smart.
max_views
number Associates to the Playlist those media with views lower than this number. Used in the type: smart.
limit
number Limit of the Media associated to the Playlist. Used in the type: smart.
sort_by
string Determine how sort of the Media associated to the Playlist. Possible values: title, description, date_created, date_recorded, views. Used in the type: smart.
sort_asc
boolean Determine if the Media associated to the Playlist will be sort ascendingly. Used in the type: smart.
seasons
[...]
playout_rules
[...]
}
RelatedLogo
{
description:
The logo image object
file*
string($binary) The binary image
}
Seller
{
email
string required: true Email for the seller
password
string required: true Password for the seller
first_name
string First name for the seller
last_name
string Last name for the seller
language
string Language configured by the seller
zones
[...]
is_seller_admin
boolean Rol for the seller admin of the reseller. (Defaults false)
}
ActivationMailTemplate
{
description:
The activation mail template of the reseller
subject
string Subject of email
message
string Message of email
signature
string Signature of email
activation_link
string example: www.example.com/activation?token=123456789 Activation links are sent when a new customer is created. The customer is not fully activated unless verify it using the link sent in the email.
}
BillingContact
{
description:
The billing contact of the reseller
name
string Name for the billing contact of the reseller
phone
string phone for the billing contact of the reseller
email
string email for the billing contact of the reseller
}
WelcomeMailTemplate
{
description:
The welcome mail template of the reseller
subject
string Subject of email
message
string Message of email
signature
string Signature of email
}
ManagementContact
SellerAdmin
Reseller
AccessRestriction
AccessRuleItem
ShowEpisode
ShowImage
ShowRelated
ShowSeason
Show
Producer
Custom_Feed_Data

-----------------------------------------------------------

Analytics API Overview This api allows you to get all information about the performance of your video ondemand, audio ondemand, video live and audio live content.
Responses All responses deliver HTTP status code and a JSON payload with a status and data object. Code object is a string with code 200 to indicate a successful operation or code error to indicate otherwise. Also the API responses with processedMB, availableQuota and time, these attributes indicate the data read, the quota available after the request and the time it took for the database to respond.
Usage Authorization & Permissions All requests must include an API authorization token.
A token must be passed with one of this methods:
The token query parameter The X-API-Token header A token can have read or read+write permissions. Please note that tokens also have an expiration date.
Before making a request, please make sure you are using a valid token with proper permissions.
You can issue authorization tokens in your account settings under "API & Tokens".
Quota Currently the requests by api, have a consumption quota:
2 TB monthly The maximum period requested is one month. Endpoint & Security The API's base endpoint is https://metrics.mdstrm.com.
Getting started POST /outbound/v1/metric/api
{ "name": "<metric_name>", "dimension": [ <dimensions> ], "filter": [ { "name": "date", "value": [ <start_date>, <end_date> ] }, <filters> ] } JSON payload example:
{ "version": "1.x.x", "code": 200, "data": [], "processedMB": 100, "availableQuota": 43333, "time": 2,14, } Error Along with the JSON payload, errors are reported with a 4xx or 5xx HTTP status code. Error examples:
HTTP 403 - Not a valid client. HTTP 404 - Not Found. The requested resource doesn't exist. HTTP 500 - Internal Server Error. The request wasn't fullfiled because of a server error. Metrics Name Dimensions Availables Filters Description Columns behavior user_id date (required) Get all information about playbacks and user behavior. duration_range_detail content date (required) Get all information about playbacks group by time range [content_id, stream, start, date, country, isp, device, os, referrer, customer_id, ip, percentage, duration_range, total_media, minutes] percentage: represents the percentage of consumption in relation to the total duration of the content. duration_range: Range where the playback matches. [0-25[, [25,50[, [50,75[, [75,100] concurrency_full date (required) Get concurrency information by live stream_per referrer,country_name,content_type,show_type,host,genre date (required) Get information about stream start_stream_time content date (required), content_type, content_id Get information about stream and playback start by time range. start_stream_minute_duration_avg content, content_id content_type, content_id Get stream, playback_start, minutes, duration and average minutes start_stream_minute_avg content_live content_type, content_live Get stream, playback_start, minutes and average minutes stream content_live, content_id, content_type date (required), content_live, content_id, content_type Get stream start content_live, content_id, content_type date (required), content_live, content_id, content_type Get Playback start unique_user content_live, content_id, content_type date (required), content_live, content_id, content_type Get number of devices Filters "filter": [ { "name": "<filter_name>", "value": [ <filter_values> ] } ] Name Description date (First filter) Range of date, this filter is required for every metric.[UTC Format] content_type kind of content values: aod, vod, vlive, alive, dvr, dar. (audio ondemand, video ondemand, video live, audio live, video recorder, audio recorder) content_id content id Dimension "dimension": [ <dimensions> ] Name Description content Ondemand Content Name user_id Customer id content_type kind of content values: aod, vod, vlive, alive, dvr, dar. (audio ondemand, video ondemand, video live, audio live, video recorder, audio recorder) content_live Live name content Media name referrer Web Domain country_name Country show_type Kind of show (podcast, radioshow) host Host of show genre Genre of show Example { "name": "duration_range_detail", "dimension": [ "content" ], "filter": [ { "name": "date", "value": [ "2020-08-01T15:32:19Z", "2020-08-01T21:32:19Z" ] } ] } Export POST /outbound/v1/metric/export
The body of the request must be the same as the one sent in the "API" point.
In the response, a JSON will be returned, where in the "data" field, the url of the exported file will be displayed.
--------------------------------------------------------------------------------
tags:
módulo
rss
mrss
feeds
podcast
api created: 2026-04-20 status: current
--------------------------------------------------------------------------------
RSS y MRSS Feeds
[!abstract] ¿Qué es esto? El sistema de Feeds de la plataforma permite exponer contenido estructurado hacia herramientas externas: apps móviles, agregadores de podcasts (Spotify, Apple Podcasts, Google Podcasts), sistemas de monetización (Google DAI / DFP), guías de programación (EPG), y cualquier integración que consuma listas de contenido. Funciona en ambos sentidos: la plataforma publica información estructurada que otras herramientas consumen automáticamente.
--------------------------------------------------------------------------------
Tabla de Contenidos
[[#¿Para qué sirve cada tipo de feed?]]
[[#Feed JSON para Apps]]
[[#Feed Podcast RSS]]
[[#Feed MRSS para Google DAI y DFP]]
[[#Feed EPG (Guía de Programación)]]
[[#Autenticación y Control de Acceso]]
[[#Caché — Cuándo los cambios se reflejan]]
[[#Campos y datos que expone cada feed]]
[[#Casos de uso comunes]]
[[#Módulos conectados]]
[[#Diagnóstico de Problemas]]
--------------------------------------------------------------------------------
¿Para qué sirve cada tipo de feed?
La plataforma tiene cuatro sistemas de feed distintos, cada uno con un propósito diferente. Es importante entender cuál aplica según el problema que se esté diagnosticando.
Sistema
Formato
Quién lo consume
URL Base
Feed JSON para Apps
JSON
Apps móviles, Smart TVs, integraciones custom
/feed/apps/{account_id}/...
Feed Podcast RSS
XML (RSS 2.0)
Spotify, Apple Podcasts, Google Podcasts, iVoox
/feeds/{account_slug}/{show_slug}
MRSS para Google DAI/DFP
XML (Media RSS)
Google Ad Manager, Google DAI
/api/account/{id}/mrss/{ad_id}/gdai/full
Feed EPG
JSON o XML
Guías de TV, apps de EPG, integraciones de programación
/api/live-stream/{id}/epg.json
[!info] Regla general Si el cliente tiene una app propia → usa Feed JSON. Si distribuye podcasts → usa Feed Podcast RSS. Si monetiza con Google DAI → usa MRSS. Si tiene guía de programación en vivo → usa EPG.
--------------------------------------------------------------------------------
Feed JSON para Apps
¿Qué es y cómo funciona?
El Feed JSON es el sistema principal para que apps (móviles, Smart TV, web) consuman el catálogo de contenido de forma estructurada. La app llama al feed, recibe una lista de categorías o medias con sus URLs de reproducción, miniaturas y metadatos, y los presenta al usuario sin tener que conocer la lógica interna de la plataforma.
El feed trabaja de forma jerárquica: primero se navegan categorías, luego contenido dentro de esas categorías. Si una categoría tiene subcategorías, el feed devuelve las subcategorías. Si tiene contenido directo, devuelve medias.
Requisitos para que funcione
Para que este feed esté disponible en una cuenta, deben estar habilitados:
modules.app_feed = true en la cuenta
feeds.enabled = true en la cuenta
Si alguno de estos está desactivado, todos los endpoints devuelven el error FEED_MODULE_NOT_ACTIVE.
Además, el acceso al contenido depende de listas de acceso configuradas en la cuenta:
feeds.categories[] → qué categorías son visibles en el feed
feeds.shows[] → qué shows son visibles en el feed
Si feeds.default_allow.categories = true → todas las categorías son accesibles sin lista explícita
Estructura de URLs
/feed/apps/{account_id}/{tipo}
/feed/apps/{account_id}/{tipo}/{id_del_recurso}
Tipo
Descripción
Ejemplo
category
Lista categorías o medias dentro de una categoría
/feed/apps/{id}/category
media
Lista medias con filtros opcionales
/feed/apps/{id}/media
show
Lista shows disponibles
/feed/apps/{id}/show
season
Lista temporadas de un show
/feed/apps/{id}/season/{show_id}
episode
Detalle de un episodio específico
/feed/apps/{id}/episode/{episode_id}
Parámetros de consulta disponibles
Parámetro
Tipo
Default
Máximo
Descripción
page
Number
1
—
Página de resultados
limit
Number
20
100
Ítems por página
sort
String
-date_created
—
Campo de ordenamiento. Prefijo - = descendente
tags
String
—
—
Tags separados por coma para filtrar medias
category
String
—
—
ID de categoría (solo en feed tipo media)
format
String
hls
—
Formato de video: hls, mpd, f4m, mp4, mp3, m4a
level
Number
0
—
Profundidad en jerarquía de categorías
¿Qué devuelve el feed?
Cada ítem del feed tiene esta estructura:
id          → ID único del recurso
type        → "video", "audio", "feed" (si apunta a otro feed)
title       → Nombre del contenido
summary     → Descripción
updated     → Fecha de última modificación (ISO 8601)
content     → { type, src } → URL de reproducción + formato MIME
media_group → Lista de imágenes en distintos tamaños
extensions  → Metadatos adicionales (IDs, fechas, ads, atributos custom)
El campo content.src es la URL directa de reproducción. Para videos es .m3u8 (HLS por defecto), .mpd (DASH), etc. Si el ítem es una categoría con subcategorías, content.src apunta a otro feed (tipo feed).
El campo extensions.video_ads incluye la URL del VMAP de publicidad si la media tiene ads asignados. Las apps deben enviar esta URL al player para que inserte publicidad.
Imágenes en el feed
Las imágenes se entregan en múltiples tamaños dentro del media_group:
image_base → URL original sin transformación
large → 319×319 px, crop centrado en rostros
small → 48×48 px, crop centrado en rostros
Tamaños adicionales según feeds.images[] configurado en la cuenta
--------------------------------------------------------------------------------
Feed Podcast RSS
¿Qué es y cómo funciona?
El Feed Podcast RSS genera un archivo XML compatible con iTunes/Apple Podcasts, Spotify, y cualquier agregador de podcasts estándar. Una vez configurado, la URL del feed se registra en las plataformas de distribución y ellas consumen el contenido automáticamente.
La URL del feed se genera automáticamente cuando se crea un show con contenido de audio. Tiene dos variantes:
Por slug (más legible): https://mdstrm.com/feeds/{account_slug}/{show_slug}
Por ID: https://mdstrm.com/feeds/{account_id}/{show_id}
Ambas apuntan al mismo contenido.
¿Qué contenido aparece en el feed?
El feed solo incluye contenido que cumpla todas estas condiciones:
El episodio tiene tipo de contenido audio (.mp3, .m4a)
El episodio está publicado (is_published = true, status = OK)
Está dentro de su ventana de disponibilidad (available_from hasta available_until)
No es un archivo de tipo "Original" o "AudioTrack" (archivos internos de edición)
Si un episodio tiene múltiples archivos de audio, el feed prioriza los .mp3. Si no hay .mp3, usa el primer archivo disponible.
Campos del feed (lo que ve Spotify/Apple)
Campo en el feed
Fuente en la plataforma
<title> del canal
show.title
<description>
show.description
<image>
Thumbnail del show (1600×1600 px)
<language>
Siempre es
<author>
show.custom_feed_data.owner_name o nombre del productor
<copyright>
show.custom_feed_data.copyright
<itunes:owner>
custom_feed_data.owner_name + owner_email
<itunes:category>
Géneros del show (mapeados a categorías iTunes)
Título del episodio
episode.title
Descripción del episodio
episode.description
Fecha de publicación
episode.first_emision o date_created
Archivo de audio (<enclosure>)
URL del archivo de audio del episodio
Duración
media.duration
Número de episodio
episode.order
Número de temporada
season.order
Tipo de episodio
full → "full", preview → "trailer", recap → "bonus"
Personalización del feed
El show tiene un campo custom_feed_data que permite sobreescribir los metadatos del feed:
Campo
Qué controla
owner_name
Nombre del autor en iTunes
owner_email
Email del autor en iTunes
copyright
Texto de copyright
link
URL del sitio web vinculado al podcast
También existe rss_show_permalink para definir una URL de sitio web personalizada, y rss_show_name para controlar el prefijo del título en el feed.
Parámetro property
/feeds/{account_slug}/{show_slug}?property=tmsid_123456
Este parámetro se añade al final de cada URL de audio en el feed. Sirve para tracking o cuando la plataforma de distribución necesita un identificador específico en las URLs. Es opcional.
--------------------------------------------------------------------------------
Feed MRSS para Google DAI y DFP
¿Qué es y para qué se usa?
MRSS (Media RSS) es un formato estándar de XML para describir contenido de video con metadatos de monetización. La plataforma genera dos variantes:
Google DAI (Dynamic Ad Insertion): Feed para que Google Ad Manager "ingiera" el catálogo de videos y genere versiones monetizadas con publicidad stitched (cosida al video).
DFP (DoubleClick for Publishers): Feed más amplio del catálogo completo con metadatos de monetización.
¿Cómo funciona Google DAI con este feed?
Se crea un Ad en la plataforma con tipo ad-insertion-google
Se asigna ese Ad a las medias que deben ser monetizadas (campo media.google_dai)
Google Ad Manager consulta el feed periódicamente para descubrir/actualizar el catálogo
Google genera URLs monetizadas propias (en dominio de Google)
El reproductor usa esas URLs de Google (no las de la plataforma) para reproducción con ads integrados
Las URLs de ingestión que Google usa son:
https://mdstrm.com/video-gdai/{media_id}.m3u8   (HLS)
https://mdstrm.com/video-gdai/{media_id}.mpd    (DASH)
[!warning] Importante Para que una media aparezca en el feed MRSS de Google DAI, debe tener el campo google_dai apuntando al Ad correcto. Si no está asignado, no aparece en el feed aunque el Ad exista.
Endpoints MRSS
Endpoint
Descripción
GET /api/account/{account_id}/mrss/{ad_id}/gdai/full
Feed MRSS para Google DAI filtrado por Ad
GET /api/account/{account_id}/dfp/full
Feed MRSS completo para DFP (todo el catálogo)
Ambos soportan paginación con ?page=1&limit=100.
El feed incluye un enlace next cuando hay más páginas:
<atom:link rel="next" href="...?page=2&limit=100" />
¿Qué metadatos incluye el feed?
Elemento XML
Descripción
<guid>
ID único de la media
<title> / <description>
Metadatos del video
<dfpvideo:ingestUrl>
URLs HLS y DASH para ingestión
<media:thumbnail>
Miniatura (280×190 px)
<dfpvideo:closedCaptionUrl>
URL del subtítulo VTT (si existe)
<dfpvideo:keyvalues>
Keywords: título, categoría, tags
<dfpvideo:stats>
Conteo de vistas
<dfpvideo:cuepoints>
Posiciones de cortes de ad (en segundos)
<dfpvideo:owner>
Nombre de la cuenta
Los cuepoints se obtienen de los Track de la media que tienen isAd: true. Estos se generan manualmente o via detección automática de smart ad markers.
--------------------------------------------------------------------------------
Feed EPG (Guía de Programación)
¿Qué es y cómo funciona?
El EPG (Electronic Program Guide) expone la parrilla de programación de un canal en vivo. Es consumido por apps de TV, guías de programación, y sistemas de gestión de contenidos externos.
A diferencia de los otros feeds que son de contenido VOD, el EPG es dinámico: refleja lo que está programado para transmitir en el stream en vivo según los schedules configurados.
URLs del EPG
GET /api/live-stream/{live_stream_id}/epg.json
GET /api/live-stream/{live_stream_id}/epg.xml
Ambos devuelven la misma información en diferente formato. El .xml usa el esquema XMLTV estándar, compatible con la mayoría de apps de guía de TV.
Parámetros de consulta
Parámetro
Tipo
Default
Descripción
start_schedule
Number
0
Días en el pasado a incluir (ej: -1 = ayer)
end_schedule
Number
0
Días en el futuro a incluir (ej: 7 = próxima semana)
Ejemplo para obtener la semana completa (ayer + 7 días):
/api/live-stream/{id}/epg.json?start_schedule=-1&end_schedule=7
[!info] Ventana máxima El EPG soporta una ventana de hasta 30 días total.
¿Qué incluye la respuesta?
{
  "channel": {
    "id": "{live_stream_id}",
    "display_name": "Nombre del Canal",
    "url": "https://mdstrm.com/live/stream.m3u8",
    "icon": [{ "src": "url_del_logo" }]
  },
  "programmes": [
    {
      "channel": "{live_stream_id}",
      "title": "Nombre del Programa",
      "category": [{ "name": "Noticias", "slug": "noticias" }],
      "start": "2026-04-20T14:00:00Z",
      "stop": "2026-04-20T15:00:00Z",
      "desc": "Descripción del programa"
    }
  ]
}
El campo programmes lista todos los bloques de programación en el rango solicitado. Soporta tanto eventos de una sola vez como programas recurrentes (con reglas de recurrencia).
EpgMask — Mapeo de campos custom
Si el cliente usa atributos custom en sus schedules, puede configurar un EpgMask en el stream en vivo para mapear esos campos a los campos estándar del EPG. Esto permite que el feed EPG muestre datos correctos aunque el cliente guarde la información en campos no estándar.
--------------------------------------------------------------------------------
Autenticación y Control de Acceso
Feed JSON — Acceso por listas
El feed JSON no requiere token de autenticación, pero el acceso al contenido está controlado por listas en la configuración de la cuenta:
Configuración
Comportamiento
feeds.categories = [id1, id2]
Solo esas categorías aparecen en el feed
feeds.shows = [id1, id2]
Solo esos shows aparecen en el feed
feeds.default_allow.categories = true
Todas las categorías son accesibles
feeds.default_allow.shows = true
Todos los shows son accesibles
Si una categoría no está en la lista y default_allow no está activo, devuelve INVALID_CATEGORY.
Feed Podcast RSS — Sin autenticación
El RSS de podcast es completamente público. No requiere token. El único control de acceso es que el show y sus episodios estén publicados (is_published = true).
Feed MRSS — Acceso por cuenta
Los endpoints MRSS son privados (requieren autenticación de API). Requieren además:
Para DFP: account.dfp.enabled = true
Para GDAI: Que el Ad exista y pertenezca a la cuenta
Feed EPG — Acceso mixto
El endpoint EPG está en rutas API con autenticación estándar. La información es pública para cuentas con el stream habilitado.
--------------------------------------------------------------------------------
Caché — Cuándo los cambios se reflejan
Este es uno de los puntos más importantes para soporte: los feeds tienen caché, lo que significa que los cambios no se ven inmediatamente.
Feed
Tiempo de caché
Notas
Feed JSON (categorías, medias)
60 segundos
Caché en Redis con hash de query
Feed Podcast RSS
600 segundos (10 min)
Caché local + Redis
Feed MRSS / DFP
Sin caché interno
Google tiene su propio ciclo de ingestión
Feed EPG
120 segundos
Caché en Redis
[!warning] Cambios no se ven de inmediato Si un cliente reporta que modificó contenido y el feed no lo refleja, lo más probable es que el caché aún no expiró. El tiempo máximo de espera es:
Feed JSON: 1 minuto
Feed Podcast: 10 minutos
No hay forma de invalidar el caché manualmente desde la UI. Se resuelve solo al expirar.
[!info] Google DAI y la ingestión Cuando se actualiza el feed MRSS, Google DAI no lo refleja instantáneamente. Google tiene su propio ciclo de ingestión (puede tomar horas). Si el cliente ve que el contenido nuevo no aparece en Google DAI, el problema puede estar en el ciclo de Google, no en la plataforma.
--------------------------------------------------------------------------------
Campos y datos que expone cada feed
Datos de media en Feed JSON
Campo
Descripción
id
ID de la media
title
Título
summary
Descripción
updated
Última modificación
content.src
URL de reproducción (HLS por defecto)
content.type
MIME type (video/hls, application/dash+xml, etc.)
extensions.mediaId
ID interno de la media
extensions.dateRecorded
Fecha de grabación
extensions.dateCreated
Fecha de creación
extensions.video_ads
URL del VMAP de publicidad (si aplica)
extensions.custom_attributes
Atributos custom de la media
media_group
Imágenes en múltiples tamaños
Datos de show/episodio en Feed JSON
Campo
Descripción
extensions.genres
Géneros del show
extensions.hosts
Presentadores
extensions.featuring
Artistas/personas destacadas
extensions.producers
Productores
extensions.firstEmision
Primera emisión
extensions.order
Número de episodio/temporada
extensions.seasonId / showId / episodeId
IDs de jerarquía
--------------------------------------------------------------------------------
Casos de uso comunes
Caso 1: App móvil que navega el catálogo
La app llama /feed/apps/{id}/category para obtener la lista de categorías raíz. El usuario selecciona una categoría → la app llama /feed/apps/{id}/category/{category_id} para ver el contenido. Si la respuesta tiene content.type = "feed", hay subcategorías. Si tiene content.type = "video/hls", hay medias reproducibles directamente.
Configuración requerida:
Activar modules.app_feed y feeds.enabled en la cuenta
Agregar las categorías deseadas a feeds.categories[]
La app usa content.src como URL de reproducción directa
Caso 2: Distribución de podcast
El cliente crea un show con temporadas y episodios de audio. La plataforma genera automáticamente una URL de RSS. El cliente registra esa URL en Apple Podcasts Connect, Spotify for Podcasters y Google Podcasts Manager. Desde ese momento, cada episodio publicado aparece automáticamente en todas las plataformas.
URL a registrar:
https://mdstrm.com/feeds/{account_slug}/{show_slug}
Configuración requerida:
Show con is_published = true
Episodios con audio y is_published = true
Opcionalmente: completar custom_feed_data con owner, copyright, etc.
Caso 3: Monetización con Google DAI
El cliente quiere que Google inserte publicidad en sus videos. El flujo es:
Crear Ad de tipo ad-insertion-google con google_dai.source_id y google_dai.hmac_token
Asignar el Ad a las medias via media.google_dai
Registrar el endpoint MRSS en Google Ad Manager
Google ingesta el feed, genera manifiestos propios
El player reproduce desde URLs de Google (no de la plataforma directamente)
Configuración requerida:
modules.vod_google_dai = true en la cuenta
Medias con google_dai asignado al Ad correcto
Cuepoints configurados si se desean ads mid-roll (desde Smart Ad Markers o manualmente)
Caso 4: Guía de programación en vivo
El cliente tiene un canal en vivo y quiere que su app muestre la programación actual y próxima. La app llama al EPG con el rango de fechas necesario y muestra la parrilla de programación.
Configuración requerida:
Stream en vivo con schedules o EventScheduleJobs creados
Llamar a /api/live-stream/{id}/epg.json?start_schedule=0&end_schedule=7
--------------------------------------------------------------------------------
Módulos conectados
[!note] Alcance Los módulos listados se relacionan con el sistema de feeds. Cada uno tiene documentación propia.
[[Media]] (VOD)
Fuente principal de contenido para Feed JSON y MRSS. Las medias deben estar publicadas y con status = OK para aparecer en los feeds.
[[Shows y Episodios]]
Fuente del Feed Podcast RSS. La jerarquía Show → Temporada → Episodio se refleja directamente en el feed y en el Feed JSON de tipo show/season/episode.
[[Categorías]]
Controlan la navegación en el Feed JSON. La jerarquía de categorías y el campo filter_categories determinan qué muestra cada nivel del feed.
[[Ads]]
El Feed JSON incluye URLs de publicidad (VMAP) en extensions.video_ads cuando la media tiene ads asignados. El MRSS para Google DAI requiere un Ad de tipo ad-insertion-google como referencia.
[[Live Streams]]
Fuente del Feed EPG. Los schedules y EventScheduleJobs del stream en vivo se exponen como programación en el feed EPG.
[[Smart Ad Markers]]
Los cuepoints de corte de publicidad que aparecen en el MRSS para Google DAI provienen de los Tracks con isAd: true de las medias. Estos se generan via detección automática (AI) o manualmente.
--------------------------------------------------------------------------------
Diagnóstico de Problemas
[!tip] Guía rápida de diagnóstico
El feed JSON devuelve FEED_MODULE_NOT_ACTIVE
Causa: El módulo de feeds no está habilitado en la cuenta.
Verificar:
En la cuenta: modules.app_feed debe ser true
En la cuenta: feeds.enabled debe ser true
Si alguno está desactivado, el feed no funciona sin importar la configuración restante.
--------------------------------------------------------------------------------
El feed JSON devuelve INVALID_CATEGORY
Causa: La categoría solicitada no está en la lista de acceso del feed.
Verificar:
Ver feeds.categories[] en la configuración de la cuenta
Confirmar que el ID de categoría consultado está en esa lista
O verificar que feeds.default_allow.categories = true
--------------------------------------------------------------------------------
Una media no aparece en el feed
Verificar en orden:
media.is_published = true y media.status = OK
La media tiene al menos una categoría que está en feeds.categories[]
La media no está en un período fuera de su ventana de disponibilidad
Esperar el TTL de caché (hasta 60 segundos)
--------------------------------------------------------------------------------
El podcast no aparece en Spotify / Apple Podcasts
El problema puede estar en múltiples niveles:
Verificar en la plataforma:
El show tiene is_published = true
Los episodios tienen audio adjunto y están publicados
La URL del feed responde correctamente: https://mdstrm.com/feeds/{account_slug}/{show_slug}
El feed devuelve al menos un <item> con <enclosure>
Verificar en la plataforma distribuidora:
Apple Podcasts: El feed debe estar validado en Podcast Connect
Spotify: El feed registrado en Spotify for Podcasters puede tardar 24-72h en procesar episodios nuevos
Cambios en metadatos (imagen, descripción) pueden tardar días en propagarse
Herramienta de validación gratuita: https://castfeedvalidator.com/ — pegar la URL del feed y valida el XML contra el estándar iTunes.
--------------------------------------------------------------------------------
El contenido actualizado no se refleja en el feed (cualquier tipo)
Causa: Caché activo.
Feed
Tiempo máximo de espera
Feed JSON
1 minuto
Feed Podcast RSS
10 minutos
Feed EPG
2 minutos
No hay invalidación manual disponible. Si el cliente no puede esperar, la única alternativa es contactar al equipo técnico para invalidar el caché en Redis.
--------------------------------------------------------------------------------
El feed MRSS no incluye una media para Google DAI
Verificar:
La media tiene media.google_dai apuntando al Ad correcto (mismo ad_id de la URL del feed)
La media tiene status = OK y is_published = true
La media es de tipo video (no audio)
El Ad existe y pertenece a la cuenta
--------------------------------------------------------------------------------
Los cuepoints no aparecen en el MRSS de Google DAI
Los cuepoints provienen de los Tracks de la media con isAd: true.
Verificar:
La media tiene Smart Ad Markers generados o tracks de ad configurados manualmente
Usar GET /api/media/{id} y revisar el campo tracks — deben existir registros con isAd: true
Si no existen, se pueden generar via POST /api/media/{id}/adbreaks (requiere módulo de AI habilitado)
--------------------------------------------------------------------------------
El EPG no muestra programas en el rango consultado
Verificar:
Existen schedules o EventScheduleJobs creados para el stream en vivo en ese rango de fechas
Los parámetros start_schedule y end_schedule están en el rango correcto
Esperar hasta 2 minutos por expiración de caché
--------------------------------------------------------------------------------