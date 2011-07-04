/*
 * Copyright 2009-2010 the original author or authors.
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

import org.mozilla.javascript.JavaScriptException;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

import java.util.ArrayList;
import java.util.List;


/**
 * @author Rostislav Hristov
 * @author Uriah Carpenter
 */
public class LessException extends Exception {

    private static final long serialVersionUID = 662552833197468936L;

    private String errorType;
    private String filename;
    private int line;
    private int column;
    private List<String> extract;

    public LessException() {
        super();
    }

    public LessException(String message) {
        super(message);
    }

    public LessException(String message, Throwable e) {
        super(message, e);
    }

    public LessException(String message, String errorType, String filename, int line, int column, List<String> extract) {
        super(message);
        this.errorType = errorType != null ? errorType : "LESS Error";
        this.filename = filename;
        this.line = line;
        this.column = column;
        this.extract = extract;
    }

    public LessException(Throwable e) {
        super(e);
    }

    @Override
    public String getMessage() {
        if (errorType != null) {
            String msg = String.format("%s: %s (line %s, column %s)", errorType, super.getMessage(), line, column);
            if (!(extract == null) && !extract.isEmpty()) {
                msg += " near";
                for (String l : extract) {
                    msg += "\n" + l;
                }
            }
            return msg;
        }

        return super.getMessage();
    }

    /**
     * Type of error as reported by less.js
     */
    public String getErrorType() {
        return errorType;
    }

    /**
     * Filename that error occured in as reported by less.js
     */
    public String getFilename() {
        return filename;
    }

    /**
     * Line number where error occurred as reported by less.js or -1 if unknown.
     */
    public int getLine() {
        return line;
    }

    /**
     * Column number where error occurred as reported by less.js or -1 if unknown.
     */
    public int getColumn() {
        return column;
    }

    /**
     * Lines around error as reported by less.js
     */
    public List<String> getExtract() {
        return extract;
    }


    public static LessException parseLessException(Exception root) throws LessException {
        if (root instanceof JavaScriptException) {

            Scriptable value = (Scriptable) ((JavaScriptException) root).getValue();

            boolean hasName = ScriptableObject.hasProperty((Scriptable) value, "name");
            boolean hasType = ScriptableObject.hasProperty((Scriptable) value, "type");

            if (hasName || hasType) {
                String errorType = "Error";

                if (hasName) {
                    String type = (String) ScriptableObject.getProperty(((Scriptable) value), "name");
                    if ("ParseError".equals(type)) {
                        errorType = "Parse Error";
                    } else {
                        errorType = type + " Error";
                    }
                } else if (hasType) {
                    Object prop = ScriptableObject.getProperty(((Scriptable) value), "type");
                    if (prop instanceof String) {
                        errorType = (String) prop + " Error";
                    }
                }

                String message = (String) ScriptableObject.getProperty(((Scriptable) value), "message");

                String filename = "";
                if (ScriptableObject.hasProperty(value, "filename")) {
                    filename = (String) ScriptableObject.getProperty(((Scriptable) value), "filename");
                }

                int line = -1;
                if (ScriptableObject.hasProperty(value, "line")) {
                    line = ((Double) ScriptableObject.getProperty(((Scriptable) value), "line")).intValue();
                }

                int column = -1;
                if (ScriptableObject.hasProperty(value, "column")) {
                    column = ((Double) ScriptableObject.getProperty(((Scriptable) value), "column")).intValue();
                }


                List<String> extractList = new ArrayList<String>();
                if (ScriptableObject.hasProperty(value, "extract")) {
                    NativeArray extract = (NativeArray) ScriptableObject.getProperty(((Scriptable) value), "extract");
                    for (int i = 0; i < extract.getLength(); i++) {
                        if (extract.get(i, extract) instanceof String) {
                            extractList.add(((String) extract.get(i, extract)).replace("\t", " "));
                        }
                    }
                }

                throw new LessException(message, errorType, filename, line, column, extractList);
            }
        }

        throw new LessException(root);
    }


}