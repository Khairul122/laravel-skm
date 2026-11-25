<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="description" content="Aplikasi Survei Kepuasan Masyarakat (SKM) dan penghitungan Indeks Kepuasan Masyarakat (IKM) sesuai Permenpan-RB Nomor 14 Tahun 2017.">
        <meta property="og:title" content="SKM Synectra — Survei Kepuasan Masyarakat">
        <meta property="og:description" content="Hitung Indeks Kepuasan Masyarakat (IKM) 9 unsur pelayanan publik secara otomatis dan hasilkan laporan Word & Markdown sesuai Permenpan-RB 14/2017.">
        <meta property="og:image" content="/images/skm/og-image.png">
        <meta property="og:type" content="website">

        <title inertia>{{ config('app.name', 'SKM Synectra') }}</title>

        <link rel="icon" type="image/svg+xml" href="/images/skm/favicon.svg">
        <link rel="alternate icon" href="/favicon.ico">
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
