<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Skema inti SKM (Permenpan-RB 14/2017).
 * Prinsip privasi: tidak ada kolom nama/NIK/kontak responden.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'operator'])->default('operator')->after('email');
        });

        // Instansi / unit penyelenggara pelayanan
        Schema::create('agencies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('unit_name', 150)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('head_name', 120)->nullable();
            $table->string('head_nip', 30)->nullable();
            $table->string('head_position', 120)->nullable();
            $table->string('logo_path', 255)->nullable();
            $table->timestamps();
        });

        // Master 9 unsur pelayanan (U1..U9)
        Schema::create('survey_elements', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique();
            $table->string('name', 120);
            $table->string('question', 255);
            $table->json('aliases')->nullable();
            $table->unsignedTinyInteger('sort_order');
            $table->timestamps();
        });

        // Jenis layanan per instansi
        Schema::create('service_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->string('name', 150);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['agency_id', 'name']);
        });

        // Periode survei (mis. Semester I 2026)
        Schema::create('survey_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained()->cascadeOnDelete();
            $table->string('label', 100);
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('population')->nullable()->comment('Populasi penerima layanan, untuk sampel Krejcie-Morgan');
            $table->enum('status', ['draft', 'active', 'closed'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['agency_id', 'status']);
        });

        // Riwayat unggah file CSV/XLSX
        Schema::create('survey_imports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('original_filename', 255);
            $table->json('column_mapping')->nullable();
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('valid_rows')->default(0);
            $table->unsignedInteger('invalid_rows')->default(0);
            $table->json('error_log')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamps();
        });

        // Responden (anonim: hanya data demografis opsional)
        Schema::create('respondents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_type_id')->constrained()->restrictOnDelete();
            $table->foreignId('survey_import_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('gender', ['L', 'P'])->nullable();
            $table->string('age_range', 20)->nullable();
            $table->string('education', 50)->nullable();
            $table->string('occupation', 80)->nullable();
            $table->date('surveyed_at')->nullable();
            $table->text('suggestion')->nullable();
            $table->timestamps();
            $table->index(['survey_period_id', 'service_type_id']);
        });

        // Jawaban per unsur (skor 1..4)
        Schema::create('respondent_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('respondent_id')->constrained()->cascadeOnDelete();
            $table->foreignId('survey_element_id')->constrained()->restrictOnDelete();
            $table->unsignedTinyInteger('score');
            $table->unique(['respondent_id', 'survey_element_id']);
            $table->index('survey_element_id');
        });

        // Snapshot hasil perhitungan IKM (service_type_id NULL = keseluruhan unit)
        Schema::create('ikm_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_type_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('respondent_count');
            $table->decimal('ikm_weighted', 7, 4)->comment('Sum NRR x 1/9, skala 1-4');
            $table->decimal('ikm_score', 5, 2)->comment('Konversi x 25, skala 25-100');
            $table->char('grade', 1);
            $table->string('performance', 30);
            $table->json('element_scores')->comment('[{code,name,nrr,nrr_weighted,conversion,rank}]');
            $table->timestamp('calculated_at');
            $table->timestamps();
            $table->index(['survey_period_id', 'service_type_id']);
        });

        // Laporan yang pernah dibuat
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('format', ['docx', 'md']);
            $table->string('file_path', 255);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
        Schema::dropIfExists('ikm_results');
        Schema::dropIfExists('respondent_answers');
        Schema::dropIfExists('respondents');
        Schema::dropIfExists('survey_imports');
        Schema::dropIfExists('survey_periods');
        Schema::dropIfExists('service_types');
        Schema::dropIfExists('survey_elements');
        Schema::dropIfExists('agencies');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('role'));
    }
};
