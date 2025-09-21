--
-- PostgreSQL database dump
--

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 15.12 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: jeobrankombou
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO jeobrankombou;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Booking; Type: TABLE; Schema: public; Owner: jeobrankombou
--

CREATE TABLE public."Booking" (
    id integer NOT NULL,
    "listingId" integer NOT NULL,
    "guestId" integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "totalCents" integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Booking" OWNER TO jeobrankombou;

--
-- Name: Booking_id_seq; Type: SEQUENCE; Schema: public; Owner: jeobrankombou
--

CREATE SEQUENCE public."Booking_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Booking_id_seq" OWNER TO jeobrankombou;

--
-- Name: Booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jeobrankombou
--

ALTER SEQUENCE public."Booking_id_seq" OWNED BY public."Booking".id;


--
-- Name: Listing; Type: TABLE; Schema: public; Owner: jeobrankombou
--

CREATE TABLE public."Listing" (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    "priceCents" integer NOT NULL,
    "ownerId" integer NOT NULL,
    photos text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Listing" OWNER TO jeobrankombou;

--
-- Name: Listing_id_seq; Type: SEQUENCE; Schema: public; Owner: jeobrankombou
--

CREATE SEQUENCE public."Listing_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Listing_id_seq" OWNER TO jeobrankombou;

--
-- Name: Listing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jeobrankombou
--

ALTER SEQUENCE public."Listing_id_seq" OWNED BY public."Listing".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: jeobrankombou
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    role text DEFAULT 'guest'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO jeobrankombou;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: jeobrankombou
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO jeobrankombou;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jeobrankombou
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: jeobrankombou
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO jeobrankombou;

--
-- Name: Booking id; Type: DEFAULT; Schema: public; Owner: jeobrankombou
--

ALTER TABLE ONLY public."Booking" ALTER COLUMN id SET DEFAULT nextval('public."Booking_id_seq"'::regclass);


--
-- Name: Listing id; Type: DEFAULT; Schema: public; Owner: jeobrankombou
--

ALTER TABLE ONLY public."Listing" ALTER COLUMN id SET DEFAULT nextval('public."Listing_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: jeobrankombou
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: jeobrankombou
--

COPY public."Booking" (id, "listingId", "guestId", "startDate", "endDate", "totalCents", status, "createdAt") FROM stdin;
\.


--
-- Data for Name: Listing; Type: TABLE DATA; Schema: public; Owner: jeobrankombou
--

COPY public."Listing" (id, title, description, "priceCents", "ownerId", photos, "createdAt") FROM stdin;
1	ff	f	12	1	{}	2025-09-20 15:01:31.871
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: jeobrankombou
--

COPY public."User" (id, email, password, name, role, "createdAt") FROM stdin;
1	je@gmail;com	12345678	jeo	guest	2025-09-20 15:00:39.815
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: jeobrankombou
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
24004bd3-a274-4382-b045-8b42e84f9cf2	d851a2d93bce077c4f5ffc00b212b5d4ca9fa8b506cb0401d15121e8fc87cfe6	2025-09-20 16:17:19.771748+02	20250920141719_init	\N	\N	2025-09-20 16:17:19.763561+02	1
\.


--
-- Name: Booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jeobrankombou
--

SELECT pg_catalog.setval('public."Booking_id_seq"', 1, false);


--
-- Name: Listing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jeobrankombou
--

SELECT pg_catalog.setval('public."Listing_id_seq"', 1, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jeobrankombou
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, true);


--
-- Name: Booking Booking_pkey; Type: CONSTRAINT; Schema: public; Owner: jeobrankombou
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY (id);


--
-- Name: Listing Listing_pkey; Type: CONSTRAINT; Schema: public; Owner: jeobrankombou
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: jeobrankombou
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: jeobrankombou
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: jeobrankombou
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Booking Booking_guestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeobrankombou
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeobrankombou
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Listing Listing_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeobrankombou
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: jeobrankombou
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

