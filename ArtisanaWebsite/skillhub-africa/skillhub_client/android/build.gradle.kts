allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

// Fix for AGP 8.0+ Namespace requirement in legacy plugins
subprojects {
    configurations.all {
        resolutionStrategy.eachDependency {
            // This is for dependency resolution, but for namespace we need to touch the extensions
        }
    }
    
    // Use a safer way to apply settings to android modules
    project.plugins.any { plugin ->
        if (plugin.javaClass.name.startsWith("com.android.build.gradle")) {
            val android = project.extensions.findByName("android") as? com.android.build.gradle.BaseExtension
            if (android?.namespace == null) {
                android?.namespace = "com.kalide.one.${project.name.replace(":", ".").replace("-", "_")}"
            }
        }
        false
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
