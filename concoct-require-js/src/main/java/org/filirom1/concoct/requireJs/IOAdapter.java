package org.filirom1.concoct.requireJs;


import org.apache.commons.io.IOUtils;
import org.mozilla.javascript.*;

import java.io.*;

public class IOAdapter extends ScriptableObject {

    private static final long serialVersionUID = 1368816246551687751L;

    @Override
    public String getClassName() {
        return "global";
    }

    /**
     * Print the string values of its arguments.
     * <p/>
     * This method is defined as a JavaScript function. Note that its arguments
     * are of the "varargs" form, which allows it to handle an arbitrary number
     * of arguments supplied to the JavaScript function.
     */
    public static void print(Context cx, Scriptable thisObj, Object[] args, Function funObj) {
        for (int i = 0; i < args.length; i++) {
            if (i > 0) System.out.print(" ");

            // Convert the arbitrary JavaScript value into a string form.
            String s = Context.toString(args[i]);
            System.out.print(s);
        }
        System.out.println();
    }

    public static void warn(Context cx, Scriptable thisObj, Object[] args, Function funObj) {
        String message = Context.toString(args[0]);
        int line = (int) Context.toNumber(args[1]);
        String source = Context.toString(args[2]);
        int column = (int) Context.toNumber(args[3]);
        cx.getErrorReporter().warning(message, null, line, source, column);
    }

    /**
     * This method is defined as a JavaScript function.
     */
    public String readFile(String path) {
        try {
            return IOUtils.toString(getResourceAsStream(path));
        } catch (RuntimeException exc) {
            throw exc;
        } catch (Exception exc) {
            throw new RuntimeException("wrap: " + exc.getMessage(), exc);
        }
    }

    /**
     * Load and execute a set of JavaScript source files.
     * <p/>
     * This method is defined as a JavaScript function.
     */
    public static void load(Context cx, Scriptable thisObj, Object[] args, Function funObj) {
        for (Object element : args) {
            String filename = Context.toString(element);

            InputStreamReader in = null;
            try {
                in = new InputStreamReader(getResourceAsStream(filename));
            } catch (Exception e) {
                //Context.reportError("Couldn't open file \"" + filename + "\".");
                throw new RuntimeException(e);
            }

            try {
                // Here we evalute the entire contents of the file as
                // a script. Text is printed only if the print() function
                // is called.
                cx.evaluateReader(thisObj, in, filename, 1, null);
            } catch (WrappedException we) {
                System.err.println(we.getWrappedException().toString());
                we.printStackTrace();
            } catch (EvaluatorException ee) {
                System.err.println("js: " + ee.getMessage());
            } catch (JavaScriptException jse) {
                System.err.println("js: " + jse.getMessage());
            } catch (IOException ioe) {
                System.err.println(ioe.toString());
            } finally {
                try {
                    in.close();
                } catch (IOException ioe) {
                    System.err.println(ioe.toString());
                }
            }
        }
    }

    public static InputStream getResourceAsStream(String path) {
        File file = new File(path);
        if (file.exists()) {
            try {
                return new FileInputStream(path);
            } catch (FileNotFoundException e) {
                throw new RuntimeException(e);
            }
        } else if (path.startsWith("./")) {
            return IOAdapter.class.getClassLoader().getResourceAsStream(path.substring(2));

        } else if (path.contains(".jar!")) {
            String resourcePath = path.split("\\.jar\\!")[1];
            return IOAdapter.class.getResourceAsStream(resourcePath);
        } else {
            throw new RuntimeException("Unable to read this file : " + path);
        }

    }
}
