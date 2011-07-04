/*
 * Copyright 2009 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.filirom1.concoct.less;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;

import org.junit.BeforeClass;
import org.junit.Test;

/**
 * @author Rostislav Hristov
 * @author Uriah Carpenter
 * @author Eliot Sykes
 * @author Filirom1
 */
public class LessCompilerTest {

    private static LessCompiler compiler;

    @BeforeClass
    public static void before() {
        compiler = new LessCompiler();
    }

    @Test
    public void parse() throws LessException {
        assertEquals("div {\n  width: 2;\n}\n", compiler.compile("div { width: 1 + 1 }"));
    }

    @Test
    public void compileToString() throws LessException, IOException {
        assertEquals("body {\n  color: #f0f0f0;\n}\n",
                compiler.compile(getUrl("test.css")));
    }

    @Test
    public void compileToFile() throws LessException, IOException {
        File tempDir = new File(System.getProperty("java.io.tmpdir"));
        File tempFile = File.createTempFile("less.css", null, tempDir);
        compiler.compile(
                new File(getUrl("test.css").getPath()),
                new File(tempFile.getAbsolutePath()));
        FileInputStream fstream = new FileInputStream(tempFile.getAbsolutePath());
        DataInputStream in = new DataInputStream(fstream);
        BufferedReader br = new BufferedReader(new InputStreamReader(in));
        String strLine;
        StringBuilder sb = new StringBuilder();
        while ((strLine = br.readLine()) != null) {
            sb.append(strLine);
        }
        in.close();
        assertEquals("body {  color: #f0f0f0;}", sb.toString());
        tempFile.delete();
    }

    @Test
    public void compileToStringForMultipleImports() throws LessException, IOException {
        String expected = "body {\n" +
                "  font-family: Arial, Helvetica;\n" +
                "}\n" +
                "body {\n" +
                "  width: 960px;\n" +
                "  margin: 0;\n" +
                "}\n" +
                "#header {\n" +
                "  border-radius: 5px;\n" +
                "  -webkit-border-radius: 5px;\n" +
                "  -moz-border-radius: 5px;\n" +
                "}\n" +
                "#footer {\n" +
                "  border-radius: 10px;\n" +
                "  -webkit-border-radius: 10px;\n" +
                "  -moz-border-radius: 10px;\n" +
                "}\n";
        assertEquals(expected, compiler.compile(getUrl("multiple-imports.css")));
    }

    @Test
    public void compileSubdirImports() throws LessException, IOException {
        compiler.compile(getUrl("root.less"));
        compiler.compile(getUrl("subdir/import-from-root.less"));
        compiler.compile(getUrl("import-from-subdir.less"));
    }

    @Test(expected = LessException.class)
    public void testUndefinedErrorInput() throws IOException, LessException {
        try {
            compiler.compile(getUrl("undefined-error.css"));
        } catch (LessException e) {
            assertTrue("is undefined error", e.getMessage().contains("Error: .bgColor is undefined (line 2, column 4)"));
            throw e;
        }

    }

    @Test(expected = LessException.class)
    public void testSyntaxErrorInput() throws IOException, LessException {
        try {
            compiler.compile(getUrl("syntax-error.css"));
        } catch (LessException e) {
            assertTrue("is syntax error", e.getMessage().contains("Syntax Error: Missing closing `}` (line -1, column -1)"));
            throw e;
        }
    }

    @Test(expected = LessException.class)
    public void testParseErrorInput() throws IOException, LessException {
        try {
            compiler.compile(getUrl("parse-error.css"));
        } catch (LessException e) {
            assertTrue("is parse error", e.getMessage().contains("Parse Error: Syntax Error on line 2"));
            throw e;
        }
    }

    private URL getUrl(String filename) {
        return getClass().getClassLoader().getResource("META-INF/" + filename);
    }

}