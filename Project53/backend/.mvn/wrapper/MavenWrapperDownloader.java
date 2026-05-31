/*
 * Copyright 2007-present the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import java.net.*;
import java.io.*;
import java.nio.channels.*;
import java.util.Properties;

public class MavenWrapperDownloader {

    private static final String WRAPPER_VERSION = "3.2.0";
    private static final String DEFAULT_MAVEN_VERSION = "3.9.5";
    private static final String MAVEN_USER_HOME = System.getProperty("user.home") + "/.m2";
    private static final String MAVEN_WRAPPER_PATH = MAVEN_USER_HOME + "/wrapper";
    private static final String MAVEN_DIR_NAME = "maven-wrapper";
    private static final String LATEST_RELEASE_BASE = "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper";

    public static void main(String[] args) throws Exception {
        String wrapperVersion = System.getProperty("wrapper.version", WRAPPER_VERSION);
        String mavenVersion = System.getProperty("maven.version", DEFAULT_MAVEN_VERSION);

        File mavenHome = getMavenHome(wrapperVersion, mavenVersion);
        if (mavenHome.exists()) {
            System.out.println("Found existing Maven installation at " + mavenHome);
        } else {
            downloadAndInstallMaven(wrapperVersion, mavenVersion, mavenHome);
        }
    }

    private static File getMavenHome(String wrapperVersion, String mavenVersion) {
        return new File(MAVEN_WRAPPER_PATH + "/" + MAVEN_DIR_NAME + "/" + mavenVersion);
    }

    private static void downloadAndInstallMaven(String wrapperVersion, String mavenVersion, File mavenHome) throws Exception {
        System.out.println("Downloading Maven " + mavenVersion + "...");
        String distributionUrl = LATEST_RELEASE_BASE + "/" + wrapperVersion + "/maven-wrapper-" + wrapperVersion + "-maven-" + mavenVersion + "-bin.zip";
        File zipFile = new File(System.getProperty("java.io.tmpdir"), "maven-wrapper.zip");
        
        downloadFile(distributionUrl, zipFile);
        
        mavenHome.getParentFile().mkdirs();
        unzip(zipFile, mavenHome.getParentFile());
        zipFile.delete();
        
        System.out.println("Maven " + mavenVersion + " installed successfully.");
    }

    private static void downloadFile(String url, File destination) throws Exception {
        URL downloadUrl = new URL(url);
        try (ReadableByteChannel rbc = Channels.newChannel(downloadUrl.openStream());
             FileOutputStream fos = new FileOutputStream(destination)) {
            fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
        }
    }

    private static void unzip(File zipFile, File destinationDir) throws IOException {
        destinationDir.mkdirs();
        try (java.util.zip.ZipFile zip = new java.util.zip.ZipFile(zipFile)) {
            java.util.Enumeration<? extends java.util.zip.ZipEntry> entries = zip.entries();
            while (entries.hasMoreElements()) {
                java.util.zip.ZipEntry entry = entries.nextElement();
                File entryFile = new File(destinationDir, entry.getName());
                if (entry.isDirectory()) {
                    entryFile.mkdirs();
                } else {
                    entryFile.getParentFile().mkdirs();
                    try (InputStream is = zip.getInputStream(entry);
                         FileOutputStream fos = new FileOutputStream(entryFile)) {
                        byte[] buffer = new byte[8192];
                        int read;
                        while ((read = is.read(buffer)) != -1) {
                            fos.write(buffer, 0, read);
                        }
                    }
                }
            }
        }
    }
}
