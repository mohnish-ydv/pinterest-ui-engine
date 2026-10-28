plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.generatedapp.shell"
    compileSdk = 34

    defaultConfig {
        // Change applicationId (and the label in strings.xml) per app
        // before shipping — two shells with the same id cannot coexist.
        applicationId = "com.generatedapp.shell"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

// AndroidX only — no other third-party dependencies. The generated app
// itself is plain HTML/CSS/JS in assets; the shell is just a WebView.
dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-ktx:1.9.2")
    constraints {
        // Pin lifecycle to one coherent version: activity-ktx's POM
        // asks for 2.6.2 while core/activity transitives float, and a
        // mixed set fails AAR-metadata checks. 2.8.4 is the version
        // this shell was verified against.
        implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.4")
        implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.4")
        implementation("androidx.lifecycle:lifecycle-viewmodel-savedstate:2.8.4")
    }
}
